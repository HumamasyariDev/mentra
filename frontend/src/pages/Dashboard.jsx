import React, { useState } from 'react';
import { Bell, Search, Grid3x3, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';
import '../styles/pages/Dashboard.css';

export default function Dashboard() {
  const [selectedLength, setSelectedLength] = useState('200');

  // Get initials for avatar
  const getInitials = (name = 'User') => {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="dashboard-page">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-top">
          <div className="header-left">
            <div className="breadcrumb">Dashboard / Discover / Brand</div>
            <div className="header-title">
              <div className="instagram-logo">📷</div>
              <h1>Instagram</h1>
            </div>
          </div>
          <div className="header-right">
            <button className="btn-competitor">+ Competitor</button>
            <button className="header-icon"><Bell size={20} /></button>
            <button className="header-icon"><Search size={20} /></button>
            <div className="avatar">{getInitials('Admin User')}</div>
          </div>
        </div>

        {/* Search and Tools Bar */}
        <div className="search-tools-bar">
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Search something..." className="search-input" />
          </div>
          <div className="tools-right">
            <button className="tool-btn">Sort by ▼</button>
            <button className="tool-btn">Visible ▼</button>
            <button className="tool-btn">Filters ▼</button>
            <button className="tool-btn"><Grid3x3 size={18} /></button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Top Row - Stats and Chart */}
        <div className="top-row">
          {/* Left Panel - Stats */}
          <div className="left-panel">
            <div className="main-stat">
              <div className="stat-number">121</div>
              <div className="stat-label">Ads Running</div>
            </div>

            <div className="stat-cards">
              <div className="stat-card carousel">
                <div className="card-badge">Carousel</div>
                <div className="card-number">21</div>
              </div>
              <div className="stat-card photo">
                <div className="card-badge">Photo</div>
                <div className="card-number">35</div>
              </div>
              <div className="stat-card video">
                <div className="card-badge">Video</div>
                <div className="card-number">65</div>
              </div>
            </div>
          </div>

          {/* Right Panel - Chart */}
          <div className="right-panel">
            <div className="chart-header">
              <div>
                <h3 className="chart-title">Ads Over time</h3>
                <div className="chart-legend">
                  <span className="legend-item active">ID - Active</span>
                  <span className="legend-item inactive">ID - Inactive</span>
                </div>
              </div>
              <div className="year-selector">
                <button className="year-btn"><ChevronLeft size={16} /></button>
                <span className="year-value">2023</span>
                <button className="year-btn"><ChevronRight size={16} /></button>
              </div>
            </div>

            <div className="chart-container">
              <svg className="chart-svg" viewBox="0 0 800 250" preserveAspectRatio="xMidYMid meet">
                {/* Y Axis Labels */}
                <text x="30" y="230" fontSize="12" fill="#999">0</text>
                <text x="30" y="180" fontSize="12" fill="#999">3</text>
                <text x="30" y="130" fontSize="12" fill="#999">6</text>
                <text x="30" y="80" fontSize="12" fill="#999">9</text>

                {/* Grid lines */}
                <line x1="50" y1="220" x2="780" y2="220" stroke="#f0f0f0" strokeWidth="1" />
                <line x1="50" y1="170" x2="780" y2="170" stroke="#f0f0f0" strokeWidth="1" />
                <line x1="50" y1="120" x2="780" y2="120" stroke="#f0f0f0" strokeWidth="1" />
                <line x1="50" y1="70" x2="780" y2="70" stroke="#f0f0f0" strokeWidth="1" />

                {/* Bars */}
                <rect x="60" y="200" width="18" height="20" fill="#a8d5ff" rx="2" />
                <rect x="90" y="190" width="18" height="30" fill="#a8d5ff" rx="2" />
                <rect x="120" y="200" width="18" height="20" fill="#a8d5ff" rx="2" />
                <rect x="150" y="185" width="18" height="35" fill="#a8d5ff" rx="2" />
                <rect x="180" y="205" width="18" height="15" fill="#a8d5ff" rx="2" />
                <rect x="210" y="195" width="18" height="25" fill="#a8d5ff" rx="2" />
                <rect x="240" y="170" width="18" height="50" fill="#a8d5ff" rx="2" />
                <rect x="270" y="160" width="18" height="60" fill="#a8d5ff" rx="2" />
                <rect x="300" y="80" width="18" height="140" fill="#5fa3f0" rx="2" />
                <rect x="330" y="140" width="18" height="80" fill="#a8d5ff" rx="2" />
                <rect x="360" y="180" width="18" height="40" fill="#a8d5ff" rx="2" />
                <rect x="390" y="195" width="18" height="25" fill="#a8d5ff" rx="2" />

                {/* Line chart */}
                <polyline
                  points="69,200 99,185 129,195 159,170 189,210 219,190 249,150 279,140 309,40 339,120 369,170 399,190"
                  fill="none"
                  stroke="#333"
                  strokeWidth="2"
                />

                {/* X Axis Labels */}
                <text x="65" y="240" fontSize="12" fill="#999">Jan</text>
                <text x="95" y="240" fontSize="12" fill="#999">Feb</text>
                <text x="125" y="240" fontSize="12" fill="#999">Mar</text>
                <text x="155" y="240" fontSize="12" fill="#999">Apr</text>
                <text x="185" y="240" fontSize="12" fill="#999">May</text>
                <text x="215" y="240" fontSize="12" fill="#999">Jun</text>
                <text x="245" y="240" fontSize="12" fill="#999">Jul</text>
                <text x="275" y="240" fontSize="12" fill="#999">Aug</text>
                <text x="305" y="240" fontSize="12" fill="#999">Sep</text>
                <text x="335" y="240" fontSize="12" fill="#999">Oct</text>
                <text x="365" y="240" fontSize="12" fill="#999">Nov</text>
                <text x="395" y="240" fontSize="12" fill="#999">Dec</text>
              </svg>
            </div>
          </div>
        </div>

        {/* Middle Row - Three Columns */}
        <div className="middle-row">
          {/* Top Video Hooks */}
          <div className="middle-col">
            <h3 className="section-title">Top Video Hooks</h3>
            <div className="hooks-list">
              <div className="hook-item">Cry got a secret</div>
              <div className="hook-item">5 reasons your wallet sucks</div>
              <div className="hook-item">Hear me out...</div>
            </div>
          </div>

          {/* Top CTA */}
          <div className="middle-col">
            <h3 className="section-title">Top CTA</h3>
            <div className="cta-cards">
              <div className="cta-card">
                <div className="cta-text">Shop now</div>
                <div className="cta-badge">15%</div>
              </div>
              <div className="cta-card">
                <div className="cta-text">Learn more</div>
                <div className="cta-badge">35%</div>
              </div>
              <div className="cta-card">
                <div className="cta-text">Sign up</div>
                <div className="cta-badge">55%</div>
              </div>
            </div>
          </div>

          {/* Copy Length */}
          <div className="middle-col">
            <h3 className="section-title">Copy length</h3>
            <div className="segmented-control">
              <button
                className={`segment ${selectedLength === '50' ? 'active' : ''}`}
                onClick={() => setSelectedLength('50')}
              >
                50 or less
              </button>
              <button
                className={`segment ${selectedLength === '200' ? 'active' : ''}`}
                onClick={() => setSelectedLength('200')}
              >
                200 or less
              </button>
              <button
                className={`segment ${selectedLength === '200+' ? 'active' : ''}`}
                onClick={() => setSelectedLength('200+')}
              >
                +200
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Row - Ads Cards */}
        <div className="bottom-row">
          <h3 className="section-title">Current active Ads</h3>
          <div className="ads-grid">
            <AdCard name="Amir Baghian" username="@amirbaghi" bgColor="#17a2b8" />
            <AdCard name="Taylor Brown" username="@taylorbrown" bgColor="#495057" />
            <AdCard name="Alexa Karnash" username="@alexak" bgColor="#1c3a47" />
            <AdCard name="Ali Bagheri" username="@alibagh" bgColor="#696969" />
          </div>
        </div>
      </main>
    </div>
  );
}

function AdCard({ name, username, bgColor }) {
  return (
    <div className="ad-card">
      <div className="ad-header">
        <div className="ad-user">
          <div className="user-avatar"></div>
          <div className="user-info">
            <div className="user-name">{name}</div>
            <div className="user-username">{username}</div>
          </div>
        </div>
        <button className="ad-menu"><MoreVertical size={16} /></button>
      </div>
      <div className="ad-image" style={{ backgroundColor: bgColor }}></div>
    </div>
  );
}
