export const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

/**
 * Get color class for email category
 */
export const getCategoryColor = (category) => {
  const colors = {
    'Work': 'bg-blue-100 text-blue-800',
    'Meetings': 'bg-purple-100 text-purple-800',
    'Clients': 'bg-green-100 text-green-800',
    'Newsletters': 'bg-cyan-100 text-cyan-800',
    'HR': 'bg-pink-100 text-pink-800',
    'Financial': 'bg-yellow-100 text-yellow-800',
    'Alerts': 'bg-red-100 text-red-800',
    'Technical Support': 'bg-orange-100 text-orange-800',
    'Promotions': 'bg-lime-100 text-lime-800',
    'Personal': 'bg-indigo-100 text-indigo-800',
    'Legal': 'bg-gray-100 text-gray-800',
    'Spam': 'bg-red-200 text-red-900'
  };
  return colors[category] || 'bg-gray-100 text-gray-800';
};

/**
 * Calculate inbox statistics
 */
export const calculateStats = (emails) => {
  return {
    total: emails.length,
    important: emails.filter(e => 
      ['Work', 'Meetings', 'Alerts'].includes(e.category)
    ).length,
    spam: emails.filter(e => e.category === 'Spam').length,
    todos: emails.filter(e => 
      e.actionItems && e.actionItems.length > 0
    ).length,
    unread: emails.filter(e => !e.isRead).length
  };
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Extract email domain
 */
export const getEmailDomain = (email) => {
  if (!email) return '';
  const parts = email.split('@');
  return parts.length > 1 ? parts[1] : '';
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};
