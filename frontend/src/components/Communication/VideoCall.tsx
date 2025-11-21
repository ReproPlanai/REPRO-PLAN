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
  Minimize
} from 'lucide-react';

interface VideoCallProps {
  isActive: boolean;
  participants: Array<{
    id: string;
    name: string;
    role: string;
    isVideoOn: boolean;
    isAudioOn: boolean;
    isSpeaking: boolean;
  }>;
  onEndCall: () => void;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  onToggleMute: () => void;
  callType: 'emergency' | 'regular' | 'group';
}

const VideoCall: React.FC<VideoCallProps> = ({
  isActive,
  participants,
  onEndCall,
  onToggleVideo,
  onToggleAudio,
  onToggleMute,
  callType
}) => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Simulate call duration timer
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'POLICE': return 'border-blue-500 bg-blue-50';
      case 'MEDICAL': return 'border-purple-500 bg-purple-50';
      case 'SAFEHOUSE': return 'border-green-500 bg-green-50';
      case 'NGO': return 'border-orange-500 bg-orange-50';
      case 'ADMIN': return 'border-red-500 bg-red-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'POLICE': return '👮';
      case 'MEDICAL': return '🏥';
      case 'SAFEHOUSE': return '🏠';
      case 'NGO': return '🤝';
      case 'ADMIN': return '👑';
      default: return '👤';
    }
  };

  if (!isActive) return null;

  return (
    <div className={`fixed inset-0 bg-black z-50 ${isFullscreen ? '' : 'p-4'}`}>
      <div className={`bg-black text-white ${isFullscreen ? 'h-full' : 'h-full rounded-lg overflow-hidden'}`}>
        {/* Call Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {callType === 'emergency' && (
                  <div className="flex items-center space-x-1 bg-red-600 px-2 py-1 rounded">
                    <AlertTriangle size={16} />
                    <span className="text-sm font-medium">EMERGENCY</span>
                  </div>
                )}
                <div className="text-lg font-medium">
                  {participants.length > 1 ? 'Group Call' : 'Video Call'}
                </div>
                <div className="text-sm text-gray-300">
                  {formatDuration(callDuration)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowChat(!showChat)}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30"
              >
                <MessageCircle size={18} />
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30"
              >
                {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
              </button>
              <button
                onClick={onEndCall}
                className="p-2 bg-red-600 rounded-lg hover:bg-red-700"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Video Grid */}
        <div className="h-full flex">
          {/* Main Video Area */}
          <div className={`${showChat ? 'w-3/4' : 'w-full'} relative`}>
            <div className="h-full flex flex-wrap">
              {participants.map((participant, index) => (
                <div
                  key={participant.id}
                  className={`relative ${
                    participants.length === 1 ? 'w-full h-full' :
                    participants.length === 2 ? 'w-1/2 h-1/2' :
                    participants.length === 3 ? 'w-1/2 h-1/2' :
                    'w-1/3 h-1/3'
                  } border-2 ${getRoleColor(participant.role)}`}
                >
                  {/* Video Placeholder */}
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    {participant.isVideoOn ? (
                      <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                        <div className="text-6xl">{getRoleIcon(participant.role)}</div>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <div className="text-6xl">{getRoleIcon(participant.role)}</div>
                      </div>
                    )}
                  </div>
                  
                  {/* Participant Info */}
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{participant.name}</span>
                        <span className="text-xs bg-white/20 px-2 py-1 rounded">
                          {participant.role}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {!participant.isAudioOn && (
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        )}
                        {participant.isSpeaking && (
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Video/Audio Status */}
                  <div className="absolute top-2 right-2 flex space-x-1">
                    {!participant.isVideoOn && (
                      <div className="bg-red-600 p-1 rounded">
                        <VideoOff size={12} />
                      </div>
                    )}
                    {!participant.isAudioOn && (
                      <div className="bg-red-600 p-1 rounded">
                        <MicOff size={12} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Sidebar */}
          {showChat && (
            <div className="w-1/4 bg-gray-900 border-l border-gray-700">
              <div className="p-4 border-b border-gray-700">
                <h3 className="font-medium">Chat</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="text-sm text-gray-300">
                  Emergency call in progress. All communications are encrypted and logged.
                </div>
                <div className="flex items-center space-x-2 text-sm text-green-400">
                  <Shield size={14} />
                  <span>End-to-end encrypted</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Call Controls */}
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/50 to-transparent p-6">
          <div className="flex items-center justify-center space-x-4">
            {/* Mute/Unmute */}
            <button
              onClick={() => {
                setIsMuted(!isMuted);
                onToggleMute();
              }}
              className={`p-4 rounded-full ${
                isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>

            {/* Video On/Off */}
            <button
              onClick={() => {
                setIsVideoOn(!isVideoOn);
                onToggleVideo();
              }}
              className={`p-4 rounded-full ${
                !isVideoOn ? 'bg-red-600 hover:bg-red-700' : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
            </button>

            {/* Audio On/Off */}
            <button
              onClick={() => {
                setIsAudioOn(!isAudioOn);
                onToggleAudio();
              }}
              className={`p-4 rounded-full ${
                !isAudioOn ? 'bg-red-600 hover:bg-red-700' : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              {isAudioOn ? <Volume2 size={24} /> : <VolumeX size={24} />}
            </button>

            {/* Participants */}
            <button className="p-4 bg-white/20 rounded-full hover:bg-white/30">
              <Users size={24} />
            </button>

            {/* Settings */}
            <button className="p-4 bg-white/20 rounded-full hover:bg-white/30">
              <Settings size={24} />
            </button>

            {/* End Call */}
            <button
              onClick={onEndCall}
              className="p-4 bg-red-600 rounded-full hover:bg-red-700"
            >
              <Phone size={24} />
            </button>
          </div>
        </div>

        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute top-16 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>Recording</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCall;
