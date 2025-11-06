import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { SwapRequest, SwapRequestStatus } from '../types';
import { format } from 'date-fns';
import '../styles/Dashboard.css';

export const Requests: React.FC = () => {
  const [incoming, setIncoming] = useState<SwapRequest[]>([]);
  const [outgoing, setOutgoing] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchRequests = async () => {
    try {
      const data = await api.getSwapRequests();
      setIncoming(data.incoming);
      setOutgoing(data.outgoing);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleResponse = async (requestId: string, accept: boolean) => {
    try {
      await api.respondToSwapRequest(requestId, accept);
      const action = accept ? 'accepted' : 'rejected';
      alert(`Swap ${action} successfully!`);
      
      // Refresh all data
      await fetchRequests();
      
      // If accepted, refresh the dashboard to show updated calendar
      if (accept) {
        navigate('/dashboard');
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to respond to swap request');
    }
  };

  const getStatusColor = (status: SwapRequestStatus) => {
    switch (status) {
      case SwapRequestStatus.PENDING:
        return 'status-pending';
      case SwapRequestStatus.ACCEPTED:
        return 'status-accepted';
      case SwapRequestStatus.REJECTED:
        return 'status-rejected';
      default:
        return '';
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
          <h2>Swap Requests</h2>
        </div>

        <div className="requests-container">
          {/* Incoming Requests */}
          <section className="requests-section">
            <h3>📥 Incoming Requests ({incoming.length})</h3>
            {incoming.length === 0 ? (
              <div className="empty-state">
                <p>No incoming swap requests.</p>
              </div>
            ) : (
              <div className="requests-list">
                {incoming.map((request) => (
                  <div key={request.id} className="request-card">
                    <div className="request-header">
                      <h4>Swap Request from {request.initiator.name}</h4>
                      <span className={`status-badge ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                    <div className="swap-details">
                      <div className="swap-slot">
                        <h5>They Offer:</h5>
                        <p><strong>{request.initiatorSlot.title}</strong></p>
                        <p>📅 {format(new Date(request.initiatorSlot.startTime), 'PPP')}</p>
                        <p>🕐 {format(new Date(request.initiatorSlot.startTime), 'p')} - {format(new Date(request.initiatorSlot.endTime), 'p')}</p>
                      </div>
                      <div className="swap-arrow">⇄</div>
                      <div className="swap-slot">
                        <h5>For Your Slot:</h5>
                        <p><strong>{request.receiverSlot.title}</strong></p>
                        <p>📅 {format(new Date(request.receiverSlot.startTime), 'PPP')}</p>
                        <p>🕐 {format(new Date(request.receiverSlot.startTime), 'p')} - {format(new Date(request.receiverSlot.endTime), 'p')}</p>
                      </div>
                    </div>
                    <div className="request-actions">
                      <button
                        onClick={() => handleResponse(request.id, true)}
                        className="btn-success"
                      >
                        ✓ Accept
                      </button>
                      <button
                        onClick={() => handleResponse(request.id, false)}
                        className="btn-danger"
                      >
                        ✗ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Outgoing Requests */}
          <section className="requests-section">
            <h3>📤 Outgoing Requests ({outgoing.length})</h3>
            {outgoing.length === 0 ? (
              <div className="empty-state">
                <p>No outgoing swap requests.</p>
              </div>
            ) : (
              <div className="requests-list">
                {outgoing.map((request) => (
                  <div key={request.id} className="request-card">
                    <div className="request-header">
                      <h4>Request to {request.receiver.name}</h4>
                      <span className={`status-badge ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                    <div className="swap-details">
                      <div className="swap-slot">
                        <h5>You Offered:</h5>
                        <p><strong>{request.initiatorSlot.title}</strong></p>
                        <p>📅 {format(new Date(request.initiatorSlot.startTime), 'PPP')}</p>
                        <p>🕐 {format(new Date(request.initiatorSlot.startTime), 'p')} - {format(new Date(request.initiatorSlot.endTime), 'p')}</p>
                      </div>
                      <div className="swap-arrow">⇄</div>
                      <div className="swap-slot">
                        <h5>For Their Slot:</h5>
                        <p><strong>{request.receiverSlot.title}</strong></p>
                        <p>📅 {format(new Date(request.receiverSlot.startTime), 'PPP')}</p>
                        <p>🕐 {format(new Date(request.receiverSlot.startTime), 'p')} - {format(new Date(request.receiverSlot.endTime), 'p')}</p>
                      </div>
                    </div>
                    {request.status === SwapRequestStatus.PENDING && (
                      <p className="pending-text">Waiting for response...</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
