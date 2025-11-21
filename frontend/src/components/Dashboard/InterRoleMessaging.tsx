import React, { useState } from 'react';
import { MessageSquare, Send, Bell, X, AlertCircle, CheckCircle } from 'lucide-react';
import { useStakeholderAPI } from '../../hooks/useStakeholderAPI';
import { apiService } from '../../services/api';

interface InterRoleMessagingProps {
  role: string;
  stakeholderId?: number;
  allowedRoles?: string[];
}

const InterRoleMessaging: React.FC<InterRoleMessagingProps> = ({
  role,
  stakeholderId,
  allowedRoles = []
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [messageType, setMessageType] = useState('notification');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('medium');
  const [sending, setSending] = useState(false);

  const stakeholderAPI = useStakeholderAPI({ role, stakeholderId });

  const roleOptions = allowedRoles.length > 0 
    ? allowedRoles 
    : ['POLICE', 'SAFEHOUSE', 'MEDICAL', 'NGO', 'ADMIN'];

  const handleSendMessage = async () => {
    if (!selectedRole || !subject || !content) {
      alert('Please fill in all required fields');
      return;
    }

    setSending(true);
    try {
      await stakeholderAPI.sendMessage({
        toRole: selectedRole,
        messageType,
        subject,
        content,
        priority
      });
      alert('Message sent successfully!');
      setShowModal(false);
      setSubject('');
      setContent('');
      setSelectedRole('');
    } catch (error: any) {
      alert(`Error sending message: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  const unreadCount = stakeholderAPI.messages.filter(m => !m.isRead).length;

  return (
    <div className="space-y-4">
      {/* Messages Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Inter-Role Messages</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Send size={16} />
          <span>Send Message</span>
        </button>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {stakeholderAPI.loading ? (
          <div className="p-8 text-center text-gray-500">Loading messages...</div>
        ) : stakeholderAPI.messages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No messages yet</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {stakeholderAPI.messages.map((message) => (
              <div
                key={message.id}
                className={`p-4 hover:bg-gray-50 ${!message.isRead ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        From: {message.fromRole}
                      </span>
                      {!message.isRead && (
                        <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded">
                          New
                        </span>
                      )}
                      <span className={`px-2 py-0.5 text-xs rounded ${
                        message.priority === 'critical' ? 'bg-red-100 text-red-800' :
                        message.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        message.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {message.priority}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">{message.subject}</h4>
                    <p className="text-sm text-gray-600 mb-2">{message.content}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Type: {message.messageType}</span>
                      <span>{new Date(message.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!message.isRead && (
                      <button
                        onClick={async () => {
                          try {
                            await apiService.markMessageRead(message.id);
                            stakeholderAPI.fetchMessages();
                          } catch (error) {
                            console.error('Error marking message as read:', error);
                          }
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Mark as read"
                      >
                        <CheckCircle size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Send Message Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Send Message</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Role *
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select role</option>
                  {roleOptions.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message Type *
                </label>
                <select
                  value={messageType}
                  onChange={(e) => setMessageType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="notification">Notification</option>
                  <option value="alert">Alert</option>
                  <option value="request">Request</option>
                  <option value="update">Update</option>
                  <option value="data_share">Data Share</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter message subject"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content *
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter message content"
                />
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <button
                  onClick={handleSendMessage}
                  disabled={sending || !selectedRole || !subject || !content}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {sending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterRoleMessaging;

