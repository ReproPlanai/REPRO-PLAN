import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Volume2, 
  VolumeX,
  Users,
  Settings,
  MessageCircle,
  Shield,
  AlertTriangle,
  X,
  Maximize,
  Minimize,
  MonitorUp,
  Send,
  Sparkles,
  Copy
} from 'lucide-react';
import { connect, Room, LocalTrack, RemoteTrack, LocalParticipant, RemoteParticipant, LocalVideoTrack } from 'twilio-video';

interface VideoCallProps {
  isActive: boolean;
  roomName?: string;
  token?: string;
  userName?: string;
  onEndCall: () => void;
  callType: 'emergency' | 'regular' | 'group';
}

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: Date;
  isAI?: boolean;
}

const VideoCall: React.FC<VideoCallProps> = ({
  isActive,
  roomName,
  token,
  userName = 'User',
  onEndCall,
  callType
}) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<Map<string, RemoteParticipant>>(new Map());
  const [localVideoTrack, setLocalVideoTrack] = useState<LocalTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<LocalTrack | null>(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isAIEnabled, setIsAIEnabled] = useState(true);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const screenShareRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Twilio Video room
  useEffect(() => {
    if (!isActive || !token || !roomName) return;

    const connectToRoom = async () => {
      try {
        const connectedRoom = await connect(token, {
          name: roomName,
          audio: true,
          video: { width: 640, height: 480, frameRate: 24, facingMode: 'user' },
          dominantSpeaker: true,
          networkQuality: { local: 1, remote: 1 }
        });

        setRoom(connectedRoom);

        // Get local tracks
        connectedRoom.localParticipant.videoTracks.forEach(publication => {
          setLocalVideoTrack(publication.track);
          if (localVideoRef.current && publication.track) {
            publication.track.attach(localVideoRef.current);
          }
        });

        connectedRoom.localParticipant.audioTracks.forEach(publication => {
          setLocalAudioTrack(publication.track);
        });

        // Handle existing participants
        connectedRoom.participants.forEach(participant => {
          setParticipants(prev => new Map(prev).set(participant.sid, participant));
        });

        // Handle new participants joining
        connectedRoom.on('participantConnected', participant => {
          setParticipants(prev => new Map(prev).set(participant.sid, participant));
        });

        // Handle participants leaving
        connectedRoom.on('participantDisconnected', participant => {
          setParticipants(prev => {
            const newMap = new Map(prev);
            newMap.delete(participant.sid);
            return newMap;
          });
        });

        // Handle track subscriptions
        connectedRoom.on('trackSubscribed', (track, publication, participant) => {
          if (track.kind === 'video') {
            const videoElement = document.createElement('video');
            videoElement.autoplay = true;
            videoElement.muted = false;
            track.attach(videoElement);
            remoteVideoRefs.current.set(participant.sid + '-' + track.kind, videoElement);
          }
        });

        connectedRoom.on('trackUnsubscribed', track => {
          // Track is already detached by Twilio when unsubscribed
          // Clean up any attached elements if needed
          if (track.kind === 'video') {
            const videoElement = remoteVideoRefs.current.get(track.name);
            if (videoElement) {
              videoElement.remove();
              remoteVideoRefs.current.delete(track.name);
            }
          }
        });

      } catch (error) {
        console.error('Error connecting to Twilio room:', error);
        setConnectionError('Failed to connect to video call. Please check your connection and try again.');
      }
    };

    connectToRoom();

    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [isActive, token, roomName]);

  // Call duration timer
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleVideo = async () => {
    if (room) {
      if (isVideoOn) {
        room.localParticipant.videoTracks.forEach(publication => {
          publication.track?.disable();
        });
      } else {
        room.localParticipant.videoTracks.forEach(publication => {
          publication.track?.enable();
        });
      }
      setIsVideoOn(!isVideoOn);
    }
  };

  const toggleAudio = async () => {
    if (room) {
      if (isAudioOn) {
        room.localParticipant.audioTracks.forEach(publication => {
          publication.track?.disable();
        });
      } else {
        room.localParticipant.audioTracks.forEach(publication => {
          publication.track?.enable();
        });
      }
      setIsAudioOn(!isAudioOn);
    }
  };

  const toggleScreenShare = async () => {
    if (!room) return;

    try {
      if (isScreenSharing) {
        // Stop screen sharing
        room.localParticipant.videoTracks.forEach(publication => {
          if (publication.track && publication.track.name.includes('screen')) {
            publication.track.stop();
            publication.unpublish();
          }
        });
        setIsScreenSharing(false);
      } else {
        // Start screen sharing
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });

        const screenTrack = stream.getVideoTracks()[0];
        if (screenTrack) {
          await room.localParticipant.publishTrack(
            new LocalVideoTrack(screenTrack, { name: 'screen-share' })
          );
          setIsScreenSharing(true);
        }
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // In a real implementation, this would trigger backend recording
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      sender: userName,
      message: newMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, message]);
    setNewMessage('');

    // AI response integration
    if (isAIEnabled) {
      setTimeout(() => {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ReproBot AI',
          message: `I understand you said: "${newMessage}". I'm here to assist with any SRHR-related questions during your call.`,
          timestamp: new Date(),
          isAI: true
        };
        setChatMessages(prev => [...prev, aiMessage]);
      }, 1000);
    }
  };

  const copyRoomLink = () => {
    if (roomName) {
      navigator.clipboard.writeText(`${window.location.origin}/call/${roomName}`);
    }
  };

  if (!isActive) return null;

  const participantCount = participants.size + 1; // +1 for local user

  return (
    <div className={`fixed inset-0 bg-black z-50 ${isFullscreen ? '' : 'p-4'}`}>
      <div className={`bg-black text-white ${isFullscreen ? 'h-full' : 'h-full rounded-2xl overflow-hidden'}`}>
        {/* Connection Error */}
        {connectionError && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90">
            <div className="bg-gray-900 p-6 rounded-2xl max-w-md text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Connection Error</h3>
              <p className="text-gray-400 mb-4">{connectionError}</p>
              <button
                onClick={onEndCall}
                className="px-6 py-2 bg-red-600 rounded-lg hover:bg-red-700"
              >
                End Call
              </button>
            </div>
          </div>
        )}

        {/* Call Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {callType === 'emergency' && (
                  <div className="flex items-center gap-1 bg-red-600 px-3 py-1.5 rounded-full">
                    <AlertTriangle size={16} />
                    <span className="text-sm font-semibold">EMERGENCY</span>
                  </div>
                )}
                <div className="text-lg font-semibold">
                  {participantCount > 2 ? 'Group Call' : 'Video Call'}
                </div>
                <div className="text-sm text-gray-300 font-mono">
                  {formatDuration(callDuration)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={copyRoomLink}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                title="Copy room link"
              >
                <Copy size={18} />
              </button>
              <button
                onClick={() => setShowChat(!showChat)}
                className={`p-2 rounded-lg transition-colors ${showChat ? 'bg-primary-600' : 'bg-white/20 hover:bg-white/30'}`}
                title="Chat"
              >
                <MessageCircle size={18} />
              </button>
              <button
                onClick={() => setShowParticipants(!showParticipants)}
                className={`p-2 rounded-lg transition-colors ${showParticipants ? 'bg-primary-600' : 'bg-white/20 hover:bg-white/30'}`}
                title="Participants"
              >
                <Users size={18} />
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                title="Fullscreen"
              >
                {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
              </button>
              <button
                onClick={onEndCall}
                className="p-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                title="End call"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Video Grid */}
        <div className="h-full flex">
          {/* Main Video Area */}
          <div className={`${showChat || showParticipants ? 'w-3/4' : 'w-full'} relative`}>
            <div className="h-full flex flex-wrap p-2 gap-2">
              {/* Local Video */}
              <div className={`relative bg-gray-900 rounded-xl overflow-hidden ${
                participantCount === 1 ? 'w-full h-full' :
                participantCount === 2 ? 'w-1/2 h-1/2' :
                participantCount <= 4 ? 'w-1/2 h-1/2' :
                'w-1/3 h-1/3'
              }`}>
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className={`w-full h-full object-cover ${!isVideoOn ? 'hidden' : ''}`}
                />
                {!isVideoOn && (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                    <div className="text-6xl">👤</div>
                  </div>
                )}
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <span className="text-sm font-medium bg-black/50 px-2 py-1 rounded">You</span>
                  {!isAudioOn && <MicOff size={14} className="text-red-500" />}
                </div>
              </div>

              {/* Remote Participants */}
              {Array.from(participants.values()).map((participant) => (
                <div
                  key={participant.sid}
                  className={`relative bg-gray-900 rounded-xl overflow-hidden ${
                    participantCount === 1 ? 'w-full h-full' :
                    participantCount === 2 ? 'w-1/2 h-1/2' :
                    participantCount <= 4 ? 'w-1/2 h-1/2' :
                    'w-1/3 h-1/3'
                  }`}
                >
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <div className="text-6xl">👤</div>
                  </div>
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <span className="text-sm font-medium bg-black/50 px-2 py-1 rounded">
                      {participant.identity || 'Participant'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Sidebar */}
          {showChat && (
            <div className="w-1/4 bg-gray-900 border-l border-gray-800 flex flex-col">
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <MessageCircle size={18} />
                  Chat
                </h3>
                <button
                  onClick={() => setIsAIEnabled(!isAIEnabled)}
                  className={`p-1.5 rounded-lg transition-colors ${isAIEnabled ? 'bg-primary-600' : 'bg-gray-800'}`}
                  title="Toggle AI Assistant"
                >
                  <Sparkles size={14} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-gray-500 text-sm py-8">
                    <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
                    <p>No messages yet</p>
                    <p className="text-xs mt-1">Start the conversation</p>
                  </div>
                ) : (
                  chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-lg ${
                        msg.isAI
                          ? 'bg-purple-900/30 border border-purple-700/50'
                          : msg.sender === userName
                          ? 'bg-primary-600'
                          : 'bg-gray-800'
                      }`}
                    >
                      {msg.isAI && (
                        <div className="flex items-center gap-1 text-xs text-purple-400 mb-1">
                          <Sparkles size={12} />
                          <span>ReproBot AI</span>
                        </div>
                      )}
                      {!msg.isAI && (
                        <div className="text-xs opacity-75 mb-1">{msg.sender}</div>
                      )}
                      <p className="text-sm">{msg.message}</p>
                      <div className="text-xs opacity-50 mt-1">
                        {msg.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-4 border-t border-gray-800">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    onClick={sendMessage}
                    className="p-2 bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Participants Sidebar */}
          {showParticipants && (
            <div className="w-1/4 bg-gray-900 border-l border-gray-800 flex flex-col">
              <div className="p-4 border-b border-gray-800">
                <h3 className="font-semibold flex items-center gap-2">
                  <Users size={18} />
                  Participants ({participantCount})
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <div className="p-3 bg-primary-600/20 border border-primary-600/50 rounded-lg flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">👤</div>
                  <div className="flex-1">
                    <div className="font-medium">You</div>
                    <div className="text-xs text-gray-400">Host</div>
                  </div>
                  {!isAudioOn && <MicOff size={14} className="text-red-500" />}
                </div>
                {Array.from(participants.values()).map((participant) => (
                  <div
                    key={participant.sid}
                    className="p-3 bg-gray-800 rounded-lg flex items-center gap-3"
                  >
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">👤</div>
                    <div className="flex-1">
                      <div className="font-medium">{participant.identity || 'Participant'}</div>
                      <div className="text-xs text-gray-400">Guest</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Call Controls */}
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-6">
          <div className="flex items-center justify-center gap-3">
            {/* Mute/Unmute */}
            <button
              onClick={toggleAudio}
              className={`p-4 rounded-full transition-all ${
                !isAudioOn ? 'bg-red-600 hover:bg-red-700' : 'bg-white/20 hover:bg-white/30'
              }`}
              title="Toggle microphone"
            >
              {isAudioOn ? <Mic size={24} /> : <MicOff size={24} />}
            </button>

            {/* Video On/Off */}
            <button
              onClick={toggleVideo}
              className={`p-4 rounded-full transition-all ${
                !isVideoOn ? 'bg-red-600 hover:bg-red-700' : 'bg-white/20 hover:bg-white/30'
              }`}
              title="Toggle camera"
            >
              {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
            </button>

            {/* Screen Share */}
            <button
              onClick={toggleScreenShare}
              className={`p-4 rounded-full transition-all ${
                isScreenSharing ? 'bg-primary-600 hover:bg-primary-700' : 'bg-white/20 hover:bg-white/30'
              }`}
              title="Toggle screen sharing"
            >
              <MonitorUp size={24} />
            </button>

            {/* Recording */}
            <button
              onClick={toggleRecording}
              className={`p-4 rounded-full transition-all ${
                isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-white/20 hover:bg-white/30'
              }`}
              title="Toggle recording"
            >
              <div className={`w-6 h-6 rounded-full ${isRecording ? 'bg-white animate-pulse' : 'bg-red-500'}`} />
            </button>

            {/* Participants */}
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className={`p-4 rounded-full transition-all ${showParticipants ? 'bg-primary-600' : 'bg-white/20 hover:bg-white/30'}`}
              title="Participants"
            >
              <Users size={24} />
            </button>

            {/* Chat */}
            <button
              onClick={() => setShowChat(!showChat)}
              className={`p-4 rounded-full transition-all ${showChat ? 'bg-primary-600' : 'bg-white/20 hover:bg-white/30'}`}
              title="Chat"
            >
              <MessageCircle size={24} />
            </button>

            {/* Settings */}
            <button
              className="p-4 bg-white/20 rounded-full hover:bg-white/30 transition-all"
              title="Settings"
            >
              <Settings size={24} />
            </button>

            {/* End Call */}
            <button
              onClick={onEndCall}
              className="p-4 bg-red-600 rounded-full hover:bg-red-700 transition-all"
              title="End call"
            >
              <Phone size={24} />
            </button>
          </div>
        </div>

        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute top-20 left-4 bg-red-600 text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-2 animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full" />
            <span className="font-medium">Recording</span>
          </div>
        )}

        {/* Screen Share Indicator */}
        {isScreenSharing && (
          <div className="absolute top-20 left-4 bg-primary-600 text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-2">
            <MonitorUp size={14} />
            <span className="font-medium">Screen Sharing</span>
          </div>
        )}

        {/* Security Badge */}
        <div className="absolute bottom-20 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <Shield size={14} className="text-green-400" />
          <span className="text-xs text-gray-300">End-to-end encrypted</span>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
