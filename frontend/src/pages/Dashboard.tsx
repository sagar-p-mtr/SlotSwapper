import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Event, EventStatus } from '../types';
import { format } from 'date-fns';
import '../styles/Dashboard.css';

export const Dashboard: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchEvents = async () => {
    try {
      const data = await api.getEvents();
      setEvents(data);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await api.createEvent(title, startTime, endTime);
      setShowModal(false);
      setTitle('');
      setStartTime('');
      setEndTime('');
      fetchEvents();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create event');
    }
  };

  const handleToggleSwappable = async (event: Event) => {
    try {
      const newStatus = event.status === EventStatus.BUSY 
        ? EventStatus.SWAPPABLE 
        : EventStatus.BUSY;
      
      await api.updateEvent(event.id, { status: newStatus });
      fetchEvents();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update event');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      await api.deleteEvent(id);
      fetchEvents();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete event');
    }
  };

  const getStatusBadge = (status: EventStatus) => {
    const badges = {
      [EventStatus.BUSY]: 'status-busy',
      [EventStatus.SWAPPABLE]: 'status-swappable',
      [EventStatus.SWAP_PENDING]: 'status-pending'
    };
    return badges[status];
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <h1>SlotSwapper</h1>
        <div className="nav-links">
          <span>Welcome, {user?.name}</span>
          <button onClick={() => navigate('/dashboard')}>My Calendar</button>
          <button onClick={() => navigate('/marketplace')}>Marketplace</button>
          <button onClick={() => navigate('/requests')}>Requests</button>
          <button onClick={logout} className="btn-secondary">Logout</button>
        </div>
      </nav>

      <div className="content">
        <div className="header">
          <h2>My Calendar</h2>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            + Create Event
          </button>
        </div>

        {events.length === 0 ? (
          <div className="empty-state">
            <p>No events yet. Create your first event to get started!</p>
          </div>
        ) : (
          <div className="events-list">
            {events.map((event) => (
              <div key={event.id} className="event-card">
                <div className="event-header">
                  <h3>{event.title}</h3>
                  <span className={`status-badge ${getStatusBadge(event.status)}`}>
                    {event.status}
                  </span>
                </div>
                <div className="event-details">
                  <p>
                    📅 {format(new Date(event.startTime), 'PPP')}
                  </p>
                  <p>
                    🕐 {format(new Date(event.startTime), 'p')} - {format(new Date(event.endTime), 'p')}
                  </p>
                </div>
                <div className="event-actions">
                  {event.status !== EventStatus.SWAP_PENDING && (
                    <button
                      onClick={() => handleToggleSwappable(event)}
                      className={event.status === EventStatus.SWAPPABLE ? 'btn-secondary' : 'btn-primary'}
                    >
                      {event.status === EventStatus.SWAPPABLE ? 'Mark as Busy' : 'Make Swappable'}
                    </button>
                  )}
                  {event.status === EventStatus.SWAP_PENDING && (
                    <span className="pending-text">Swap Pending...</span>
                  )}
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    disabled={event.status === EventStatus.SWAP_PENDING}
                    className="btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Event</h2>
            <form onSubmit={handleCreateEvent}>
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="startTime">Start Time</label>
                <input
                  id="startTime"
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="endTime">End Time</label>
                <input
                  id="endTime"
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
              {error && <div className="error-message">{error}</div>}
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
