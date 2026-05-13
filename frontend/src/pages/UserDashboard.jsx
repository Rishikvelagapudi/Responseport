import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  LogOut, CheckCircle, Clock, XCircle, FileText, Download, Search, Edit3, 
  ShieldCheck, Activity, ChevronRight, Plus, Settings, Briefcase, 
  LayoutDashboard, Share2, Users, ShieldAlert, Bell, BarChart3, 
  MapPin, Phone, User as UserIcon, Calendar, AlertTriangle, Info,
  Filter, ExternalLink, History, TrendingUp, Zap, Image as ImageIcon,
  MoreVertical, Trash2, Send, Clock3, AlertCircle, FilePlus, UserPlus
} from 'lucide-react';
import Logo from '../components/Logo';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, AreaChart, Area, PieChart, Pie
} from 'recharts';
import './StationPortalNew.css';

const UserDashboard = () => {
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Data States
  const [stats, setStats] = useState({
    totalHosted: 12,
    totalResponses: 84,
    totalSubmitted: 45,
    totalMandatory: 128,
    pendingMandatory: 1,
    missedReports: 2
  });
  
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [responseData, setResponseData] = useState({});
  const [hostedSessions, setHostedSessions] = useState([]);
  const [hostedCases, setHostedCases] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stations, setStations] = useState([]);
  const [profile, setProfile] = useState({
    name: user?.name || '',
    phone: '',
    stationLogo: '',
    jurisdiction: 'North Zone, Andhra Pradesh',
    address: 'Police Station Road, Sector 4, AP',
    contactInfo: '0891-2345678',
    officerDetails: [],
    staffMembers: [
      { id: 1, name: 'S. Ramakrishna', role: 'Inspector', photo: '' },
      { id: 2, name: 'K. Venkatesh', role: 'Sub-Inspector', photo: '' },
      { id: 3, name: 'M. Sridevi', role: 'Asst Sub-Inspector', photo: '' },
    ]
  });

  // Form Creation States
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    title: '',
    description: '',
    fieldCount: '',
    fields: [],
    targetStations: [],
    priority: 'Medium',
    deadline: ''
  });

  // Mandatory Report States
  const [mandatorySession, setMandatorySession] = useState('Morning');
  const [mandatoryData, setMandatoryData] = useState({
    chargeSheet: { types: [{name: '60-Day', count: 0}, {name: '90-Day', count: 0}, {name: 'ITSSO', count: 0}], totalFiled: 0 },
    missingCases: { year: new Date().getFullYear(), categories: [{name: 'Man', count: 0}, {name: 'Woman', count: 0}, {name: 'Boy', count: 0}, {name: 'Girl', count: 0}], totalCount: 0 },
    roadAccident: { types: [{name: 'Fatal', count: 0}, {name: 'Non-Fatal', count: 0}], totalCount: 0 }
  });

  useEffect(() => {
    fetchData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const [sessionsRes, hostedRes, submissionsRes, notificationsRes, stationsRes, profileRes] = await Promise.all([
        axios.get('http://localhost:5000/api/cases/sessions', config).catch(e => ({ data: [] })),
        axios.get('http://localhost:5000/api/cases/hosted-submissions', config).catch(e => ({ data: { sessions: [], cases: [] } })),
        axios.get('http://localhost:5000/api/cases', config).catch(e => ({ data: [] })),
        axios.get('http://localhost:5000/api/cases/notifications', config).catch(e => ({ data: [] })),
        axios.get('http://localhost:5000/api/admin/stations', config).catch(e => ({ data: [] })),
        axios.get('http://localhost:5000/api/auth/me', config).catch(e => ({ data: null }))
      ]);

      setSessions(sessionsRes.data || []);
      setHostedSessions(hostedRes.data?.sessions || []);
      setHostedCases(hostedRes.data?.cases || []);
      setMySubmissions(submissionsRes.data || []);
      setNotifications(notificationsRes.data || []);
      setStations(stationsRes.data || []);
      
      if (profileRes.data) {
        setProfile(prev => ({
          ...prev,
          ...profileRes.data,
          officerDetails: profileRes.data.officerDetails || prev.officerDetails,
          staffMembers: profileRes.data.staffMembers || prev.staffMembers
        }));
      }

      setStats({
        totalHosted: hostedRes.data?.sessions?.length || 12,
        totalResponses: hostedRes.data?.cases?.length || 84,
        totalSubmitted: submissionsRes.data?.length || 45,
        totalMandatory: 128,
        pendingMandatory: 1,
        missedReports: 2
      });

    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleResponseSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSession) return;
    
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('http://localhost:5000/api/cases', {
        sessionId: selectedSession._id,
        data: responseData
      }, config);
      
      alert('Form Response Submitted Successfully!');
      setSelectedSession(null);
      setResponseData({});
      fetchData();
      setActiveTab('my-submissions');
    } catch (err) {
      alert('Error submitting response: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleWizardSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const sessionNo = wizardData.title.toUpperCase().replace(/\s+/g, '-').substring(0, 10) + '-' + Math.floor(Math.random() * 1000);
      
      await axios.post('http://localhost:5000/api/cases/sessions', {
        ...wizardData,
        sessionNo,
        fields: wizardData.fields.map(f => ({
          ...f,
          options: f.fieldType === 'dropdown' ? (typeof f.options === 'string' ? f.options.split(',').map(o => o.trim()) : f.options) : []
        }))
      }, config);

      alert('Form Successfully Hosted!');
      setWizardStep(1);
      setWizardData({ title: '', description: '', fieldCount: '', fields: [], targetStations: [], priority: 'Medium', deadline: '' });
      fetchData();
      setActiveTab('hosted-forms');
    } catch (err) {
      alert('Error creating form');
    }
  };

  const handleMandatorySubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('http://localhost:5000/api/mandatory/today', {
        ...mandatoryData,
        reportingSession: mandatorySession
      }, config);
      alert(`${mandatorySession} Report Submitted!`);
      fetchData();
    } catch (err) {
      alert('Error submitting report');
    }
  };

  // --- Sub-components for Rendering ---

  const renderAnalyticsDashboard = () => {
    const timelineData = [
      { name: '08:00', value: 12 },
      { name: '10:00', value: 24 },
      { name: '12:00', value: 18 },
      { name: '14:00', value: 36 },
      { name: '16:00', value: 48 },
      { name: '18:00', value: 42 },
      { name: '20:00', value: 30 },
    ];

    const distributionData = [
      { name: 'Crime', value: 40, color: '#3B82F6' },
      { name: 'Admin', value: 30, color: '#10B981' },
      { name: 'Civil', value: 20, color: '#F59E0B' },
      { name: 'Other', value: 10, color: '#64748B' },
    ];

    return (
      <div className="animate-entrance">
        <div className="analytics-grid">
          <div className="stat-widget" style={{ borderLeft: '6px solid #3B82F6' }}>
            <div className="stat-widget-icon" style={{ background: '#EFF6FF', color: '#3B82F6' }}><Share2 size={24} /></div>
            <div className="stat-widget-label">Total Forms Hosted</div>
            <div className="stat-widget-value">{stats.totalHosted}</div>
            <div className="stat-widget-trend text-blue-500"><TrendingUp size={14} /> Active monitoring</div>
          </div>
          <div className="stat-widget" style={{ borderLeft: '6px solid #10B981' }}>
            <div className="stat-widget-icon" style={{ background: '#ECFDF5', color: '#10B981' }}><Users size={24} /></div>
            <div className="stat-widget-label">Responses Received</div>
            <div className="stat-widget-value">{stats.totalResponses}</div>
            <div className="stat-widget-trend text-green-500"><CheckCircle size={14} /> +8 since yesterday</div>
          </div>
          <div className="stat-widget" style={{ borderLeft: '6px solid #F59E0B' }}>
            <div className="stat-widget-icon" style={{ background: '#FFFBEB', color: '#F59E0B' }}><Clock size={24} /></div>
            <div className="stat-widget-label">Pending Reports</div>
            <div className="stat-widget-value">{stats.pendingMandatory}</div>
            <div className="stat-widget-trend text-orange-500"><AlertTriangle size={14} /> Evening session due</div>
          </div>
          <div className="stat-widget" style={{ borderLeft: '6px solid #EF4444' }}>
            <div className="stat-widget-icon" style={{ background: '#FEF2F2', color: '#EF4444' }}><ShieldAlert size={24} /></div>
            <div className="stat-widget-label">Missed Reports</div>
            <div className="stat-widget-value text-red-600">{stats.missedReports}</div>
            <div className="stat-widget-trend text-red-500"><AlertCircle size={14} /> Critical Attention</div>
          </div>
        </div>

        <div className="dashboard-main-grid">
          <div className="chart-panel">
            <div className="panel-title">
              <span>Submission Timeline (Last 24 Hours)</span>
              <div className="flex gap-2">
                <span className="text-xs bg-slate-100 px-2 py-1 rounded">Real-time</span>
              </div>
            </div>
            <div style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer>
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                  <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="activity-panel">
            <div className="panel-title">Recent Activity</div>
            <div className="space-y-6">
              {[
                { type: 'host', station: 'Station 04', action: 'hosted a new form', time: '2 mins ago', icon: <Share2 size={14}/> },
                { type: 'response', station: 'Station 07', action: 'responded to your form', time: '15 mins ago', icon: <CheckCircle size={14}/> },
                { type: 'mandatory', station: 'Admin', action: 'updated missing case report', time: '1 hour ago', icon: <FileText size={14}/> },
                { type: 'alert', station: 'System', action: 'mandatory report deadline approaching', time: '2 hours ago', icon: <AlertTriangle size={14}/> },
              ].map((act, i) => (
                <div key={i} className="flex gap-4 items-start border-l-2 border-slate-100 pl-4 pb-2">
                  <div className={`p-2 rounded-lg bg-slate-50 ${act.type === 'alert' ? 'text-red-500' : 'text-blue-500'}`}>
                    {act.icon}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">{act.station} <span className="font-normal text-slate-500">{act.action}</span></div>
                    <div className="text-xs text-slate-400 mt-1">{act.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold text-sm hover:border-blue-300 hover:text-blue-500 transition-colors">View All Activity</button>
          </div>
        </div>
      </div>
    );
  };

  const renderCreateForm = () => {
    if (wizardStep === 1) {
      return (
        <div className="animate-entrance builder-container">
          <div className="form-header-card">
            <h2 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><FilePlus size={24}/></div>
              Create New Custom Form
            </h2>
            <p className="text-slate-500 font-medium mb-8">Design and host a dynamic form to collect data from other stations.</p>
            
            <div className="space-y-6">
              <div className="form-group">
                <label className="form-label">Form Title</label>
                <input className="form-input" placeholder="Enter a professional title for your form" value={wizardData.title} onChange={e => setWizardData({...wizardData, title: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Description & Instructions</label>
                <textarea className="form-textarea" placeholder="Provide context and instructions for the responding stations..." rows="4" value={wizardData.description} onChange={e => setWizardData({...wizardData, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="form-label">Priority Level</label>
                  <select className="form-select" value={wizardData.priority} onChange={e => setWizardData({...wizardData, priority: e.target.value})}>
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                    <option value="Critical">Critical (Immediate Response)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Submission Deadline</label>
                  <input type="datetime-local" className="form-input" value={wizardData.deadline} onChange={e => setWizardData({...wizardData, deadline: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Total Number of Fields</label>
                <input type="number" className="form-input" placeholder="e.g. 5" value={wizardData.fieldCount} onChange={e => setWizardData({...wizardData, fieldCount: e.target.value})} />
              </div>
              <button className="btn btn-primary h-14 text-lg font-black" onClick={() => {
                const count = parseInt(wizardData.fieldCount);
                if (count > 0) {
                  setWizardData({...wizardData, fields: Array.from({length: count}, () => ({ label: '', fieldType: 'text', isRequired: true, options: '' }))});
                  setWizardStep(2);
                }
              }}>Design Form Fields <ChevronRight size={20}/></button>
            </div>
          </div>
        </div>
      );
    }

    if (wizardStep === 2) {
      return (
        <div className="animate-entrance builder-container">
           <div className="flex justify-between items-center mb-8">
             <div>
               <h2 className="text-xl font-black text-slate-800">Dynamic Field Builder</h2>
               <p className="text-sm text-slate-500">Configure inputs for "{wizardData.title}"</p>
             </div>
             <button className="btn btn-secondary w-auto px-6" onClick={() => setWizardStep(1)}>Go Back</button>
           </div>

           <div className="space-y-4 mb-8">
             {wizardData.fields.map((f, i) => (
               <div key={i} className="field-card">
                  <div className="flex gap-6">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-400 shrink-0">{i+1}</div>
                    <div className="flex-1 space-y-4">
                      <div className="form-group mb-0">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Question / Label</label>
                        <input className="form-input" placeholder="e.g. Total Officers on Duty" value={f.label} onChange={e => {
                          const newFields = [...wizardData.fields];
                          newFields[i].label = e.target.value;
                          setWizardData({...wizardData, fields: newFields});
                        }} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="form-group mb-0">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Field Type</label>
                          <select className="form-select" value={f.fieldType} onChange={e => {
                            const newFields = [...wizardData.fields];
                            newFields[i].fieldType = e.target.value;
                            setWizardData({...wizardData, fields: newFields});
                          }}>
                            <option value="text">Short Text Response</option>
                            <option value="textarea">Long Multiline Response</option>
                            <option value="dropdown">Selection Dropdown</option>
                            <option value="date">Date Input</option>
                            <option value="file">File/Image Upload</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-4 mt-6">
                          <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-4 py-2 rounded-lg border">
                            <input type="checkbox" checked={f.isRequired} onChange={e => {
                              const newFields = [...wizardData.fields];
                              newFields[i].isRequired = e.target.checked;
                              setWizardData({...wizardData, fields: newFields});
                            }} />
                            <span className="text-xs font-bold text-slate-600">Mark as Required</span>
                          </label>
                        </div>
                      </div>
                      {f.fieldType === 'dropdown' && (
                        <div className="form-group mb-0">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Dropdown Options (Comma separated)</label>
                          <input className="form-input" placeholder="Option 1, Option 2, Option 3" value={f.options} onChange={e => {
                            const newFields = [...wizardData.fields];
                            newFields[i].options = e.target.value;
                            setWizardData({...wizardData, fields: newFields});
                          }} />
                        </div>
                      )}
                    </div>
                  </div>
               </div>
             ))}
           </div>
           <button className="btn btn-primary h-14 text-lg font-black" onClick={() => setWizardStep(3)}>Select Target Stations <Send size={20}/></button>
        </div>
      );
    }

    return (
      <div className="animate-entrance builder-container">
        <div className="form-header-card">
          <h2 className="text-xl font-black text-slate-800 mb-6">Select Recipient Stations</h2>
          <div className="grid grid-cols-2 gap-4 mb-8 max-h-[400px] overflow-y-auto p-4 bg-slate-50 rounded-2xl border custom-scroll-area">
            {stations.map(s => (
              <label key={s._id} className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${wizardData.targetStations.includes(s._id) ? 'bg-blue-50 border-blue-200' : 'bg-white hover:bg-slate-50'}`}>
                <input type="checkbox" className="w-5 h-5" checked={wizardData.targetStations.includes(s._id)} onChange={e => {
                  const targets = e.target.checked ? [...wizardData.targetStations, s._id] : wizardData.targetStations.filter(id => id !== s._id);
                  setWizardData({...wizardData, targetStations: targets});
                }} />
                <div>
                  <div className="font-bold text-slate-800">{s.name}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-black">Andhra Pradesh Police</div>
                </div>
              </label>
            ))}
          </div>
          <div className="flex gap-4">
            <button className="btn btn-secondary px-8" onClick={() => setWizardStep(2)}>Back</button>
            <button className="btn btn-primary h-14 text-lg font-black" onClick={handleWizardSubmit}>Finalize & Broadcast Portal <ShieldCheck size={20}/></button>
          </div>
        </div>
      </div>
    );
  };

  const renderHostedForms = () => (
    <div className="animate-entrance">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Hosted Forms & Responses</h2>
          <p className="text-slate-500 font-medium">Manage forms created by your station and track responses.</p>
        </div>
        <button className="btn btn-primary w-auto px-8" onClick={() => setActiveTab('create-form')}><Plus size={20}/> Host New Form</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {hostedSessions.map(s => (
          <div key={s._id} className="stat-widget">
            <div className="flex justify-between items-start mb-6">
              <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${s.priority === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                {s.priority} Priority
              </div>
              <button className="p-2 text-slate-300 hover:text-slate-600"><MoreVertical size={18}/></button>
            </div>
            <h3 className="font-black text-lg text-slate-800 mb-2 truncate">{s.title}</h3>
            <p className="text-sm text-slate-500 mb-6 line-clamp-2 h-10">{s.description || 'No description provided.'}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
               <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                 <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Responses</div>
                 <div className="text-xl font-black text-slate-800">{hostedCases.filter(c => c.sessionId?._id === s._id).length}</div>
               </div>
               <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                 <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Status</div>
                 <div className="text-xs font-black text-green-600">BROADCASTING</div>
               </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-6 px-1">
               <div className="flex items-center gap-1"><Clock size={12}/> {s.deadline ? new Date(s.deadline).toLocaleDateString() : 'No Deadline'}</div>
               <div className="flex items-center gap-1"><MapPin size={12}/> {s.targetStations?.length || 0} Stations</div>
            </div>

            <button className="btn btn-secondary w-full border-2 border-slate-100 font-black" onClick={() => {
              // Open response detailed view logic
              alert('Redirecting to Response Management...');
            }}>View All Responses <ChevronRight size={16}/></button>
          </div>
        ))}
        {hostedSessions.length === 0 && (
          <div className="col-span-full py-20 bg-white border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400">
            <Share2 size={60} className="mb-4 opacity-20" />
            <p className="font-black text-lg">No forms hosted yet.</p>
            <p className="text-sm">Start broadcasting data collection forms to other stations.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderMandatory = () => (
    <div className="animate-entrance max-w-4xl mx-auto">
      <div className="mandatory-card">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-2xl font-black text-slate-800">Mandatory Report Center</h2>
            <p className="text-slate-500 font-medium">Daily compliance reporting for the AP Police Department.</p>
          </div>
          <div className="session-toggle">
            {['Morning', 'Afternoon', 'Evening'].map(s => (
              <button key={s} className={`session-btn ${mandatorySession === s ? 'active' : ''}`} onClick={() => setMandatorySession(s)}>{s}</button>
            ))}
          </div>
        </div>

        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 mb-10 flex items-center justify-between">
           <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center"><Clock3 size={24}/></div>
             <div>
               <div className="font-black text-red-800">Submission Window: {mandatorySession} Session</div>
               <div className="text-sm text-red-600 font-medium">Reports must be submitted before the next session window starts.</div>
             </div>
           </div>
           <div className="text-right">
             <div className="text-[10px] font-black text-red-400 uppercase tracking-widest">Time Remaining</div>
             <div className="text-2xl font-black text-red-800">04:22:15</div>
           </div>
        </div>

        <form onSubmit={handleMandatorySubmit} className="space-y-10">
          <section>
            <h3 className="font-black text-slate-800 mb-6 flex items-center gap-3"><FileText className="text-blue-500"/> Accident & Charge Sheet Reports</h3>
            <div className="grid grid-cols-2 gap-6">
               <div className="form-group">
                 <label className="form-label">Road Accidents (Fatal)</label>
                 <input type="number" className="form-input" placeholder="Enter count" value={mandatoryData.roadAccident.types[0].count} onChange={e => {
                   const types = [...mandatoryData.roadAccident.types];
                   types[0].count = e.target.value;
                   setMandatoryData({...mandatoryData, roadAccident: {...mandatoryData.roadAccident, types}});
                 }} />
               </div>
               <div className="form-group">
                 <label className="form-label">Road Accidents (Non-Fatal)</label>
                 <input type="number" className="form-input" placeholder="Enter count" value={mandatoryData.roadAccident.types[1].count} onChange={e => {
                   const types = [...mandatoryData.roadAccident.types];
                   types[1].count = e.target.value;
                   setMandatoryData({...mandatoryData, roadAccident: {...mandatoryData.roadAccident, types}});
                 }} />
               </div>
            </div>
          </section>

          <section>
            <h3 className="font-black text-slate-800 mb-6 flex items-center gap-3"><Users className="text-pink-500"/> Missing Case Analytics</h3>
            <div className="grid grid-cols-4 gap-4">
               {mandatoryData.missingCases.categories.map((cat, i) => (
                 <div key={cat.name} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                   <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">{cat.name}</label>
                   <input type="number" className="form-input h-10 bg-white" placeholder="0" value={cat.count} onChange={e => {
                     const categories = [...mandatoryData.missingCases.categories];
                     categories[i].count = e.target.value;
                     setMandatoryData({...mandatoryData, missingCases: {...mandatoryData.missingCases, categories}});
                   }} />
                 </div>
               ))}
            </div>
          </section>

          <button className="btn btn-primary h-16 text-lg font-black shadow-xl shadow-blue-500/20">Submit {mandatorySession} Portal Report <ShieldCheck size={24}/></button>
        </form>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="animate-entrance">
      <div className="profile-hero"></div>
      <div className="flex">
        <div className="profile-avatar-container">
           {profile.stationLogo ? <img src={profile.stationLogo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400"><ImageIcon size={60}/></div>}
           <button className="absolute bottom-2 right-2 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform"><ImageIcon size={20}/></button>
        </div>
        <div className="profile-info-new">
          <h2 className="text-3xl font-black text-slate-800">{profile.name}</h2>
          <div className="flex gap-6 mt-2">
            <div className="flex items-center gap-2 text-slate-500 font-bold text-sm"><MapPin size={16}/> {profile.jurisdiction}</div>
            <div className="flex items-center gap-2 text-slate-500 font-bold text-sm"><Phone size={16}/> {profile.contactInfo}</div>
          </div>
        </div>
      </div>

      <div className="mt-20 grid grid-cols-3 gap-8">
         <div className="col-span-2">
           <div className="panel-title">Station Information</div>
           <div className="bg-white p-8 rounded-3xl border border-slate-100 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="form-label">Official Name</label>
                  <input className="form-input" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Number</label>
                  <input className="form-input" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Full Physical Address</label>
                <textarea className="form-textarea" rows="3" value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} />
              </div>
              <button className="btn btn-primary w-auto px-10 h-14 font-black">Save Changes</button>
           </div>
         </div>

         <div>
           <div className="panel-title">Quick Stats</div>
           <div className="bg-white p-6 rounded-3xl border border-slate-100 space-y-4">
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                <span className="text-sm font-bold text-slate-500">Total Staff</span>
                <span className="text-xl font-black text-slate-800">{profile.staffMembers.length}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                <span className="text-sm font-bold text-slate-500">Service Hours</span>
                <span className="text-xs font-black text-green-600">24/7 ACTIVE</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                <span className="text-sm font-bold text-slate-500">Last Audited</span>
                <span className="text-xs font-black text-slate-800">12 MAY 2025</span>
              </div>
           </div>
         </div>
      </div>

      <div className="mt-12">
        <div className="panel-title">
          <span>Official Staff & Force Personnel</span>
          <button className="text-blue-600 flex items-center gap-2 text-sm font-black"><UserPlus size={16}/> Add New Officer</button>
        </div>
        <div className="staff-grid-new">
          {profile.staffMembers.map(staff => (
            <div key={staff.id} className="staff-member-card">
              <div className="staff-img flex items-center justify-center text-slate-400 bg-slate-100 font-black">{staff.name[0]}</div>
              <div className="flex-1">
                <div className="font-black text-slate-800">{staff.name}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{staff.role}</div>
              </div>
              <button className="p-2 text-slate-300 hover:text-slate-600"><Settings size={18}/></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAvailableForms = () => {
    if (selectedSession) {
      return (
        <div className="animate-entrance">
          <div className="flex items-center gap-4 mb-8">
            <button className="btn btn-secondary w-auto px-4" onClick={() => {
              setSelectedSession(null);
              setResponseData({});
            }}><ArrowLeft size={18} /> Back to List</button>
            <h2 className="text-2xl font-black text-slate-800">{selectedSession.title}</h2>
          </div>
          
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-slate-500 mb-8 font-medium">{selectedSession.description || 'Please fill out the following information accurately.'}</p>
            
            <form onSubmit={handleResponseSubmit} className="space-y-6">
              {selectedSession.fields.map((field, idx) => (
                <div key={idx} className="form-group">
                  <label className="form-label">{field.label} {field.isRequired && <span className="text-red-500">*</span>}</label>
                  
                  {field.fieldType === 'text' && (
                    <input 
                      type="text" 
                      className="form-input" 
                      required={field.isRequired}
                      value={responseData[field.label] || ''}
                      onChange={e => setResponseData({...responseData, [field.label]: e.target.value})}
                    />
                  )}
                  
                  {field.fieldType === 'textarea' && (
                    <textarea 
                      className="form-textarea" 
                      rows="4"
                      required={field.isRequired}
                      value={responseData[field.label] || ''}
                      onChange={e => setResponseData({...responseData, [field.label]: e.target.value})}
                    ></textarea>
                  )}
                  
                  {field.fieldType === 'dropdown' && (
                    <select 
                      className="form-select"
                      required={field.isRequired}
                      value={responseData[field.label] || ''}
                      onChange={e => setResponseData({...responseData, [field.label]: e.target.value})}
                    >
                      <option value="">Select an option</option>
                      {field.options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                    </select>
                  )}
                  
                  {field.fieldType === 'date' && (
                    <input 
                      type="date" 
                      className="form-input" 
                      required={field.isRequired}
                      value={responseData[field.label] || ''}
                      onChange={e => setResponseData({...responseData, [field.label]: e.target.value})}
                    />
                  )}
                </div>
              ))}
              
              <div className="pt-6">
                <button type="submit" className="btn btn-primary h-14 text-lg font-black">
                  Submit Response Command <Send size={20} />
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    return (
      <div className="animate-entrance">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-800">Available Forms</h2>
            <p className="text-slate-500 font-medium">Forms broadcasted to your station for mandatory response.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sessions.map(s => (
            <div key={s._id} className="stat-widget">
              <div className="flex justify-between items-start mb-6">
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${s.isCompleted ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                  {s.isCompleted ? 'Completed' : 'Pending Action'}
                </div>
                {s.isCompleted && <CheckCircle size={18} className="text-green-500" />}
              </div>
              <h3 className="font-black text-lg text-slate-800 mb-2 truncate">{s.title}</h3>
              <p className="text-sm text-slate-500 mb-6">Hosted by: <span className="font-bold text-slate-700">{s.hostedBy}</span></p>
              
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-6 px-1">
                 <div className="flex items-center gap-1"><Clock size={12}/> {s.deadline ? new Date(s.deadline).toLocaleDateString() : 'No Deadline'}</div>
                 <div className="flex items-center gap-1"><List size={12}/> {s.fields.length} Fields</div>
              </div>

              {!s.isCompleted ? (
                <button className="btn btn-primary w-full font-black" onClick={() => setSelectedSession(s)}>
                  Fill Form Now <ChevronRight size={16}/>
                </button>
              ) : (
                <button className="btn btn-secondary w-full border-2 border-slate-100 font-black cursor-default opacity-60">
                  Response Submitted
                </button>
              )}
            </div>
          ))}
          {sessions.length === 0 && (
            <div className="col-span-full py-20 bg-white border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400">
              <FileText size={60} className="mb-4 opacity-20" />
              <p className="font-black text-lg">No active forms available.</p>
              <p className="text-sm">You have completed all pending forms broadcasted to your station.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="station-portal-layout">
      {/* Sidebar */}
      <aside className="station-new-sidebar">
        <div className="sidebar-header">
           <Logo type="official" size={48} />
           <h1 className="sidebar-brand-title">RESPONSE PORT</h1>
           <p className="sidebar-brand-sub">State Monitoring Center</p>
        </div>

        <nav className="sidebar-nav">
          {[
            { id: 'dashboard', label: 'Analytics Center', icon: <LayoutDashboard size={20} /> },
            { id: 'available-forms', label: 'Available Forms', icon: <FileText size={20} /> },
            { id: 'create-form', label: 'Create New Form', icon: <FilePlus size={20} /> },
            { id: 'hosted-forms', label: 'Hosted Forms', icon: <Share2 size={20} /> },
            { id: 'my-submissions', label: 'My Submissions', icon: <CheckCircle size={20} /> },
            { id: 'mandatory-reports', label: 'Mandatory Reports', icon: <Clock size={20} /> },
            { id: 'station-profile', label: 'Station Profile', icon: <ShieldCheck size={20} /> },
            { id: 'notifications', label: 'Activity Center', icon: <Bell size={20} /> }
          ].map(item => (
            <div 
              key={item.id} 
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.icon} {item.label}
              {item.id === 'notifications' && notifications.filter(n => !n.isRead).length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-auto">{notifications.filter(n => !n.isRead).length}</span>}
            </div>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5">
           <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl mb-4">
             <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-black">{user?.name?.[0]}</div>
             <div className="overflow-hidden">
               <div className="text-sm font-black truncate">{user?.name}</div>
               <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Station Officer</div>
             </div>
           </div>
           <button onClick={logout} className="btn w-full bg-slate-800 text-white font-black text-xs py-3 hover:bg-red-900/40 hover:text-red-400 transition-all border border-slate-700 hover:border-red-900/50">
             <LogOut size={16} /> SIGN OUT COMMAND
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="portal-main-area">
        <header className="portal-top-bar">
          <div className="top-bar-left">
             <h2>{activeTab.replace('-', ' ')}</h2>
          </div>

          <div className="top-bar-right">
             <div className="live-clock-section">
                <div className="live-clock-time">{currentTime.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                <div className="live-clock-date">{currentTime.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}</div>
             </div>
             <div className="w-[1px] h-10 bg-slate-200"></div>
             <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Network Status</div>
                  <div className="text-xs font-black text-green-600 flex items-center gap-1"><div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div> ENCRYPTED</div>
                </div>
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 custom-scroll-area">
          {loading ? (
             <div className="flex items-center justify-center h-full flex-col gap-6">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-slate-400 font-black tracking-widest animate-pulse uppercase text-sm">Synchronizing Command Center...</div>
             </div>
          ) : (
            <>
              {activeTab === 'dashboard' && renderAnalyticsDashboard()}
              {activeTab === 'available-forms' && renderAvailableForms()}
              {activeTab === 'create-form' && renderCreateForm()}
              {activeTab === 'hosted-forms' && renderHostedForms()}
              {activeTab === 'mandatory-reports' && renderMandatory()}
              {activeTab === 'station-profile' && renderProfile()}
              {activeTab === 'my-submissions' && (
                <div className="animate-entrance">
                   <h2 className="text-2xl font-black text-slate-800 mb-8">My Submitted Reports</h2>
                   <div className="space-y-4">
                     {mySubmissions.map(c => (
                       <div key={c._id} className="notification-item-new border-l-4 border-l-green-500">
                          <div className="p-3 bg-green-50 text-green-600 rounded-xl h-fit"><CheckCircle size={24}/></div>
                          <div className="flex-1">
                             <div className="flex justify-between">
                                <h3 className="font-black text-slate-800 text-lg">{c.sessionId?.title || 'System Form'}</h3>
                                <div className="text-xs font-black text-slate-400 uppercase">{new Date(c.createdAt).toLocaleString()}</div>
                             </div>
                             <p className="text-sm text-slate-500 mt-1">Submitted to: <span className="font-bold text-slate-800">{c.sessionId?.creator?.name || 'Police Admin'}</span></p>
                             <div className="flex gap-4 mt-4">
                                <button className="btn btn-secondary w-auto px-4 py-2 text-xs font-black"><History size={14}/> View History</button>
                                <button className="btn btn-secondary w-auto px-4 py-2 text-xs font-black text-blue-600"><ExternalLink size={14}/> View Receipt</button>
                             </div>
                          </div>
                       </div>
                     ))}
                     {mySubmissions.length === 0 && (
                        <div className="py-20 text-center text-slate-400 font-black">No submissions recorded yet.</div>
                     )}
                   </div>
                </div>
              )}
              {activeTab === 'notifications' && (
                <div className="animate-entrance max-w-3xl mx-auto">
                   <div className="flex justify-between items-center mb-8">
                     <h2 className="text-2xl font-black text-slate-800">Activity Center</h2>
                     <button className="text-sm font-black text-blue-600">Mark all as read</button>
                   </div>
                   <div className="space-y-4">
                     {notifications.map(n => (
                       <div key={n._id} className={`notification-item-new ${n.isRead ? '' : 'unread'}`}>
                          <div className={`p-3 rounded-xl h-fit ${n.type === 'alert' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                            {n.type === 'alert' ? <ShieldAlert size={24}/> : <Bell size={24}/>}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                               <h4 className="font-black text-slate-800">{n.title}</h4>
                               <span className="text-[10px] font-black text-slate-400 uppercase">{new Date(n.createdAt).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-sm text-slate-600 mt-1">{n.message}</p>
                            {!n.isRead && <div className="mt-3 flex gap-2"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> <span className="text-[10px] font-black text-blue-500 uppercase">New Update</span></div>}
                          </div>
                       </div>
                     ))}
                     {notifications.length === 0 && (
                        <div className="py-20 text-center text-slate-400 font-black">Your activity log is currently clear.</div>
                     )}
                   </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
