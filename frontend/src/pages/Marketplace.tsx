import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Event, EventStatus } from '../types';
import { format } from 'date-fns';
import '../styles/Dashboard.css';

export const Marketplace: React.FC = () => {
  const [slots, setSlots] = useState<Event[]>([]);
  const [mySwappableSlots, setMySwappableSlots] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Event | null>(null);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [swappableSlots, myEvents] = await Promise.all([
        api.getSwappableSlots(),
        api.getEvents()
      ]);
      
      setSlots(swappableSlots);
      setMySwappableSlots(myEvents.filter(e => e.status === EventStatus.SWAPPABLE));
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSwap = (slot: Event) => {
    if (mySwappableSlots.length === 0) {
      alert('You need to have at least one SWAPPABLE slot to request a swap!');
      return;
    }
    setSelectedSlot(slot);
    setShowModal(true);
  };

  const handleConfirmSwap = async (mySlotId: string) => {
    if (!selectedSlot) return;

    try {
      await api.createSwapRequest(mySlotId, selectedSlot.id);
      alert('Swap request sent successfully!');
      setShowModal(false);
      setSelectedSlot(null);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create swap request');
    }
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
          <h2>Available Slots Marketplace</h2>
          <p>Browse and request swaps from other users</p>
        </div>

        {slots.length === 0 ? (
          <div className="empty-state">
            <p>No swappable slots available at the moment.</p>
          </div>
        ) : (
          <div className="events-list">
            {slots.map((slot) => (
              <div key={slot.id} className="event-card">
                <div className="event-header">
                  <h3>{slot.title}</h3>
                  <span className="status-badge status-swappable">SWAPPABLE</span>
                </div>
                <div className="event-details">
                  <p>👤 Offered by: {slot.user?.name}</p>
                  <p>📅 {format(new Date(slot.startTime), 'PPP')}</p>
                  <p>
                    🕐 {format(new Date(slot.startTime), 'p')} - {format(new Date(slot.endTime), 'p')}
                  </p>
                </div>
                <div className="event-actions">
                  <button
                    onClick={() => handleRequestSwap(slot)}
                    className="btn-primary"
                  >
                    Request Swap
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && selectedSlot && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Select Your Slot to Offer</h2>
            <p>You are requesting: <strong>{selectedSlot.title}</strong></p>
            <p className="modal-subtitle">Choose one of your swappable slots to offer in exchange:</p>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="slots-selection">
              {mySwappableSlots.map((slot) => (
                <div key={slot.id} className="selection-card" onClick={() => handleConfirmSwap(slot.id)}>
                  <h4>{slot.title}</h4>
                  <p>📅 {format(new Date(slot.startTime), 'PPP')}</p>
                  <p>🕐 {format(new Date(slot.startTime), 'p')} - {format(new Date(slot.endTime), 'p')}</p>
                </div>
              ))}
            </div>
            
            <div className="modal-actions">
              <button onClick={() => setShowModal(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
