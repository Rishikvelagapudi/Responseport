import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { ShieldAlert, ArrowLeft, Plus, Trash2, CheckCircle, XCircle, FileText, Activity, Download, Search, Users, ChevronRight, BarChart2, LayoutDashboard, Settings, Filter, Briefcase } from 'lucide-react';
import Logo from '../components/Logo';

const AdminDashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, forms, responses, users
  
  const [sessions, setSessions] = useState([]);
  const [schema, setSchema] = useState([]);
  const [cases, setCases] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [mandatoryForms, setMandatoryForms] = useState([]);
  const [mandatorySearch, setMandatorySearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [selectedFile, setSelectedFile] = useState(null);

  // â”€â”€ Form Creation Wizard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [wizardStep, setWizardStep] = useState(1); // 1=title+count, 2=fields, 3=done
  const [wizardTitle, setWizardTitle] = useState('');
  const [wizardFieldCount, setWizardFieldCount] = useState('');
  const [wizardFields, setWizardFields] = useState([]);
  const [wizardError, setWizardError] = useState('');
  const [wizardPublishing, setWizardPublishing] = useState(false);
  const [responseFilter, setResponseFilter] = useState('all');
  const [responseSearch, setResponseSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, [user.token]);

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const [schemaRes, casesRes, sessionsRes, usersRes, mandatoryRes] = await Promise.all([
        axios.get('/api/admin/schema', config),
        axios.get('/api/admin/cases', config),
        axios.get('/api/admin/sessions', config),
        axios.get('/api/admin/users', config).catch(() => ({ data: [] })),
        axios.get('/api/mandatory/all', config).catch(() => ({ data: [] }))
      ]);
      console.log('--- ADMIN FETCH DATA ---');
      console.log('Sessions Fetched:', sessionsRes.data);
      setSchema(schemaRes.data);
      setCases(casesRes.data);
      setSessions(sessionsRes.data);
      setUsersList(usersRes.data);
      setMandatoryForms(mandatoryRes.data);
    } catch (err) { // eslint-disable-line no-unused-vars

      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (id) => {
    if (!window.confirm('Delete this form?')) return;
    try {
      await axios.delete(`/api/admin/sessions/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchData();
    } catch (err) { // eslint-disable-line no-unused-vars
 alert('Error deleting form'); }
  };

  // â”€â”€ Wizard Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleWizardStep1 = (e) => {
    e.preventDefault();
    const count = parseInt(wizardFieldCount);
    if (!wizardTitle.trim() || !count || count < 1 || count > 30) {
      setWizardError('Enter a valid title and field count (1â€“30).');
      return;
    }
    setWizardError('');
    setWizardFields(Array.from({ length: count }, () => ({
      label: '', fieldName: '', fieldType: 'text', isRequired: false, options: ''
    })));
    setWizardStep(2);
  };

  const handleWizardFieldChange = (i, key, value) => {
    const updated = [...wizardFields];
    updated[i] = { ...updated[i], [key]: value };
    if (key === 'label') updated[i].fieldName = value.replace(/\s+/g, '_').toLowerCase();
    setWizardFields(updated);
  };

  const handleWizardPublish = async () => {
    if (wizardFields.some(f => !f.label.trim())) {
      setWizardError('All fields must have a label.');
      return;
    }
    setWizardPublishing(true);
    setWizardError('');
    try {
      const sessionNo = wizardTitle.replace(/\s+/g, '-').toUpperCase() + '-' + Date.now().toString().slice(-5);
      const fieldsToPublish = wizardFields.map(f => ({
        ...f,
        fieldName: f.label.replace(/\s+/g, '_').toLowerCase(),
        options: f.fieldType === 'dropdown' && f.options ? (typeof f.options === 'string' ? f.options.split(',').map(o => o.trim()) : f.options) : []
      }));
      
      console.log('Publishing Fields:', fieldsToPublish);
      
      const payload = { 
        sessionNo, 
        title: wizardTitle, 
        fields: JSON.parse(JSON.stringify(fieldsToPublish))
      };
      
      console.log('--- WIZARD PUBLISH ---');
      console.log('Payload:', payload);
      
      await axios.post('/api/admin/sessions', payload, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setWizardStep(3);
      fetchData();
    } catch (err) { // eslint-disable-line no-unused-vars

      setWizardError(err.response?.data?.error || 'Error publishing form.');
    } finally { setWizardPublishing(false); }
  };

  const resetWizard = () => {
    setWizardStep(1); setWizardTitle(''); setWizardFieldCount('');
    setWizardFields([]); setWizardError('');
  };

  // eslint-disable-next-line no-unused-vars
  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.put(`/api/admin/cases/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchData();
    } catch (err) { // eslint-disable-line no-unused-vars

      console.error(err);
      alert('Error updating status');
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      await axios.put(`/api/admin/users/${userId}/role`, { role: newRole }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchData();
      alert('User role updated successfully');
    } catch (err) { // eslint-disable-line no-unused-vars

      console.error(err);
      alert('Error updating user role');
    }
  };

  const handleExportCSV = () => {
    const csvRows = [];
    const headers = ['Session No', 'User ID', 'User Name', 'Status', 'Created At'];
    
    // Determine which fields to use as headers
    let exportFields = schema;
    if (responseFilter !== 'all') {
      const selectedSession = sessions.find(s => s._id === responseFilter);
      if (selectedSession && selectedSession.fields) {
        let f = selectedSession.fields;
        if (typeof f === 'string') try { f = JSON.parse(f); } catch (err) { // eslint-disable-line no-unused-vars
 f = []; }
        if (Array.isArray(f) && f.length > 0) exportFields = f;
      }
    }
    
    exportFields.forEach(field => headers.push(`Data_${field.label}`));
    csvRows.push(headers.join(','));

    filteredCases.forEach(c => {
      const row = [c.sessionId?.sessionNo || 'N/A', c.userId?._id, `"${c.userId?.name || 'Unknown'}"`, c.status, new Date(c.createdAt).toLocaleDateString()];
      
      // Safety parse data
      let d = c.data;
      if (typeof d === 'string') try { d = JSON.parse(d); } catch (err) { // eslint-disable-line no-unused-vars
 d = {}; }
      
      exportFields.forEach(field => {
        let val = (d && d[field.fieldName]) ? d[field.fieldName] : '';
        val = val.toString().replace(/"/g, '""');
        row.push(`"${val}"`);
      });
      csvRows.push(row.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `ResponseExport_${new Date().toISOString().split('T')[0]}.csv`);
    a.click();
  };

  if (loading) return <div className="app-container"><div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', flexDirection:'column', gap:'20px'}}>
    <div className="auth-pulse-ring" style={{width:'60px', height:'60px'}}></div>
    <div style={{color:'var(--primary)', fontWeight:'bold'}}>Initializing Secure Admin Environment...</div>
  </div></div>;

  const totalResponses = cases.length;
  // eslint-disable-next-line no-unused-vars
  const pendingCount = cases.filter(c => c.status === 'pending').length;
  const filteredCases = cases.filter(c => {
    const matchesFilter = responseFilter === 'all' || c.sessionId?._id === responseFilter;
    
    // Safety parse data for search if it's a string
    let d = c.data;
    if (typeof d === 'string') try { d = JSON.parse(d); } catch (err) { // eslint-disable-line no-unused-vars
 d = {}; }
    
    const searchStr = (
      (c.userId?.name || '') + ' ' + 
      (c.userId?.email || '') + ' ' + 
      (c.sessionId?.title || '') + ' ' + 
      (c.sessionId?.sessionNo || '') + ' ' +
      JSON.stringify(d)
    ).toLowerCase();
    
    const matchesSearch = !responseSearch || searchStr.includes(responseSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });
  
  const filteredMandatory = mandatoryForms.filter(m => {
     if(!mandatorySearch) return true;
     const query = mandatorySearch.toLowerCase();
     
     // Explicitly search key fields for better reliability
     const userName = m.userId?.name?.toLowerCase() || '';
     const userEmail = m.userId?.email?.toLowerCase() || '';
     const year = m.missingCases?.year?.toString() || '';
     
     // Search in Charge Sheets
     const chargeSheets = m.chargeSheet?.types.map(t => t.name.toLowerCase() + t.count.toString()).join(' ') || '';
     
     // Search in Missing Cases
     const missingCases = m.missingCases?.categories.map(c => c.name.toLowerCase() + c.details.toLowerCase()).join(' ') || '';
     
     // Search in Road Accidents
     const roadAccidents = m.roadAccident?.types.map(t => t.name.toLowerCase() + t.details.toLowerCase()).join(' ') || '';

     return userName.includes(query) || 
            userEmail.includes(query) || 
            year.includes(query) || 
            chargeSheets.includes(query) || 
            missingCases.includes(query) || 
            roadAccidents.includes(query) ||
            JSON.stringify(m).toLowerCase().includes(query);
  });

  return (
    <div style={{ background: '#F1F5F9', minHeight: '100vh', fontFamily: "'Outfit', sans-serif" }}>
      
      {/* Modals/Overlays */}
      {selectedFile && (
        <div className="modal-overlay" onClick={() => setSelectedFile(null)} style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.8)', zIndex: 1000, display:'flex', justifyContent:'center', alignItems:'center' }}>
           <div className="modal-content" onClick={e => e.stopPropagation()} style={{ background: '#fff', padding: '20px', borderRadius: '12px', width: '80%', height: '80%', display:'flex', flexDirection:'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0 }}>Document Viewer / Details</h3>
                <button onClick={() => setSelectedFile(null)} style={{ background: 'transparent', border:'none', cursor:'pointer' }}><XCircle size={24} /></button>
             </div>
             <div style={{ flex: 1, overflow: 'auto', display:'flex', justifyContent:'center', alignItems:'center', background: '#F8FAFC', borderRadius: '8px', padding: '20px' }}>
                {selectedFile.type === 'json' ? (
                  <div style={{ width: '100%', height: '100%', overflowY: 'auto', padding: '20px', background: '#fff', borderRadius: '8px' }}>
                    {Object.entries(JSON.parse(selectedFile.data)).map(([key, value]) => (
                      <div key={key} style={{ marginBottom: '20px', borderBottom: '1px solid #F1F5F9', paddingBottom: '15px' }}>
                        <div style={{ fontWeight: '700', color: '#020617', marginBottom: '8px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{key.replace(/_/g, ' ')}</div>
                        {typeof value === 'object' && value !== null && value.url ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#F8FAFC', padding: '15px', borderRadius: '12px' }}>
                             <div style={{ fontWeight: '600', color: '#64748B', fontSize: '0.8rem' }}>Image Attachment:</div>
                             <img src={value.url} alt="Attachment" style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '8px' }} />
                             <div style={{ fontWeight: '600', color: '#64748B', fontSize: '0.8rem', marginTop: '10px' }}>Description:</div>
                             <div style={{ color: '#334155', fontSize: '1rem' }}>{value.desc || 'No description provided.'}</div>
                             <a href={value.url} target="_blank" rel="noopener noreferrer" style={{ color: '#0F172A', textDecoration: 'none', fontWeight: '600', fontSize: '0.85rem' }}>ðŸ”— Open Full Image</a>
                          </div>
                        ) : typeof value === 'string' && (value.startsWith('http') || value.includes('cloudinary.com')) ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <a href={value} target="_blank" rel="noopener noreferrer" style={{ color: '#0F172A', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                               ðŸ”— View Original Attachment
                            </a>
                            {(value.match(/\.(jpeg|jpg|gif|png|webp|svg)/i) || value.includes('cloudinary.com')) && (
                              <img src={value} alt="Attachment" style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '12px', border: '2px solid #F1F5F9', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                            )}
                          </div>
                        ) : (
                          <div style={{ color: '#334155', fontSize: '1rem', lineHeight: '1.5' }}>{value?.toString() || 'â€”'}</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  selectedFile.type === 'image' ? <img src={selectedFile.data} alt="Doc" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /> : <iframe src={selectedFile.data} title="Doc" width="100%" height="100%" style={{ border: 'none' }} />
                )}
             </div>
           </div>
        </div>
      )}

      {/* Top Navigation */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 5%', height: '70px', background: 'linear-gradient(135deg, #020617 0%, #1E293B 100%)', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.4rem', fontWeight: 'bold' }}>
          <Logo size={28} color="#fff" />
          <span>Response Port <span style={{fontSize: '0.8rem', opacity: 0.8, marginLeft: '10px', fontWeight: 'normal'}}>ADMIN CENTER</span></span>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <button onClick={() => navigate('/admin-home')} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', padding: '8px 15px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>
      </nav>

      {/* Sub Header / Tabs Navigation */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', padding: '0 5%', display: 'flex', gap: '10px' }}>
        {[
          { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18}/> },
          { id: 'forms', label: 'Create Form', icon: <Briefcase size={18}/> },
          { id: 'responses', label: 'Responses', icon: <FileText size={18}/> },
          { id: 'mandatory', label: 'Mandatory Reports', icon: <BarChart2 size={18}/> },
          { id: 'users', label: 'User Management', icon: <Users size={18}/> }
        ].map(item => (
          <button 
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{ 
              padding: '18px 25px', 
              background: 'transparent', 
              border: 'none', 
              borderBottom: activeTab === item.id ? '3px solid #1E293B' : '3px solid transparent',
              color: activeTab === item.id ? '#1E293B' : '#64748B',
              fontWeight: activeTab === item.id ? '700' : '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.2s'
            }}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '40px 5%' }}>
        
        {/* --- DASHBOARD TAB --- */}
        {activeTab === 'dashboard' && (
          <div className='animate-fade-in'>
            {/* Premium Stats Grid */}
            <div className='grid grid-cols-4' style={{ gap: '24px', marginBottom: '32px' }}>
              {[
                { label: 'Total Forms', val: sessions.length, icon: <FileText />, color: '#1E293B', bg: 'linear-gradient(135deg, #F1F5F9, #E2E8F0)' },
                { label: 'Total Responses', val: totalResponses, icon: <Activity />, color: '#334155', bg: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)' },
                { label: 'Active Users', val: usersList.length, icon: <Users />, color: '#10B981', bg: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)' },
                { label: "Today's Log", val: cases.filter(c => new Date(c.createdAt).toDateString() === new Date().toDateString()).length, icon: <ShieldAlert />, color: '#F59E0B', bg: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)' }
              ].map((stat, i) => (
                <div key={i} style={{ 
                  background: '#fff', 
                  padding: '24px', 
                  borderRadius: '24px', 
                  border: '1px solid #E2E8F0', 
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  transition: 'transform 0.2s',
                  cursor: 'default'
                }}>
                  <div style={{ background: stat.bg, width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                    {React.cloneElement(stat.icon, { size: 24 })}
                  </div>
                  <div>
                    <div style={{ fontSize: '2rem', fontWeight: '900', color: '#1E293B', letterSpacing: '-0.02em' }}>{stat.val}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Visual Analytics Row */}
            <div className='grid grid-cols-3' style={{ gap: '24px', marginBottom: '32px' }}>
              
              <div style={{ background: '#fff', padding: '30px', borderRadius: '24px', border: '1px solid #E2E8F0', gridColumn: 'span 1', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '25px', width: '100%', textAlign: 'left' }}>Status Overview</h3>
                <div style={{ position: 'relative', width: '180px', height: '180px' }}>
                  <svg viewBox='0 0 36 36' style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    <circle cx='18' cy='18' r='15.915' fill='transparent' stroke='#F1F5F9' strokeWidth='3.5'></circle>
                    {(() => {
                      const approved = cases.filter(c => c.status === 'approved').length;
                      const rejected = cases.filter(c => c.status === 'rejected').length;
                      const pending = cases.filter(c => c.status === 'pending').length;
                      const total = cases.length || 1;
                      const pPerc = (pending / total) * 100;
                      const aPerc = (approved / total) * 100;
                      const rPerc = (rejected / total) * 100;
                      return (
                        <>
                          <circle cx='18' cy='18' r='15.915' fill='transparent' stroke='#F59E0B' strokeWidth='3.5' strokeDasharray={`${pPerc} ${100 - pPerc}`} strokeDashoffset='0'></circle>
                          <circle cx='18' cy='18' r='15.915' fill='transparent' stroke='#10B981' strokeWidth='3.5' strokeDasharray={`${aPerc} ${100 - aPerc}`} strokeDashoffset={-pPerc}></circle>
                          <circle cx='18' cy='18' r='15.915' fill='transparent' stroke='#EF4444' strokeWidth='3.5' strokeDasharray={`${rPerc} ${100 - rPerc}`} strokeDashoffset={-(pPerc + aPerc)}></circle>
                        </>
                      );
                    })()}
                  </svg>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '900' }}>{totalResponses}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '700' }}>TOTAL</div>
                  </div>
                </div>
                <div style={{ marginTop: '25px', width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }}/> Approved</span>
                      <span style={{ fontWeight: '700' }}>{cases.filter(c => c.status === 'approved').length}</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }}/> Pending</span>
                      <span style={{ fontWeight: '700' }}>{cases.filter(c => c.status === 'pending').length}</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }}/> Rejected</span>
                      <span style={{ fontWeight: '700' }}>{cases.filter(c => c.status === 'rejected').length}</span>
                   </div>
                </div>
              </div>

              <div style={{ background: '#fff', padding: '30px', borderRadius: '24px', border: '1px solid #E2E8F0', gridColumn: 'span 2' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Submission Velocity</h3>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '600', padding: '6px 12px', background: '#F8FAFC', borderRadius: '8px' }}>Last 7 Form Sessions</div>
                </div>
                <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', gap: '15px', padding: '0 10px', position: 'relative', borderBottom: '2px solid #F1F5F9' }}>
                   {sessions.slice(-7).map((s, i) => {
                     const count = cases.filter(c => c.sessionId?._id === s._id).length;
                     const maxHeight = Math.max(...sessions.map(sess => cases.filter(c => c.sessionId?._id === sess._id).length), 1);
                     const heightPerc = (count / maxHeight) * 100;
                     return (
                       <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                          <div style={{ 
                            width: '100%', 
                            maxWidth: '40px',
                            background: 'linear-gradient(to top, #334155, #818CF8)', 
                            height: `${heightPerc}%`, 
                            borderRadius: '10px 10px 4px 4px', 
                            position: 'relative', 
                            transition: 'height 1s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
                          }}>
                            <div style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.75rem', fontWeight: '800', color: '#4F46E5' }}>{count}</div>
                          </div>
                          <div style={{ marginTop: '12px', fontSize: '0.65rem', fontWeight: '700', color: '#64748B', maxWidth: '50px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={s.title}>{s.title}</div>
                       </div>
                     );
                   })}
                </div>
              </div>
            </div>

            <div className='grid grid-cols-2' style={{ gap: '24px' }}>
               <div style={{ background: '#fff', padding: '30px', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '20px' }}>Top Contributing Stations</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                     {usersList.filter(u => u.role === 'user').slice(0, 5).map((u, i) => {
                       const uCount = cases.filter(c => c.userId?._id === u._id).length;
                       return (
                         <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#F8FAFC', borderRadius: '14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                               <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: i === 0 ? '#FEF3C7' : '#F1F5F9', color: i === 0 ? '#D97706' : '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.8rem' }}>{i + 1}</div>
                               <div>
                                  <div style={{ fontSize: '0.9rem', fontWeight: '700' }}>{u.name}</div>
                                  <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{u.email}</div>
                               </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                               <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#1E293B' }}>{uCount}</div>
                               <div style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: '600' }}>SUBMISSIONS</div>
                            </div>
                         </div>
                       );
                     })}
                  </div>
               </div>

               <div style={{ background: '#fff', padding: '30px', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '20px' }}>Recent Audit Trail</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                     {cases.slice(0, 5).map((c, i) => (
                       <div key={i} style={{ display: 'flex', gap: '15px', position: 'relative', paddingBottom: '15px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                             <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#334155', zIndex: 1 }} />
                             {i < 4 && <div style={{ width: '2px', flex: 1, background: '#F1F5F9', margin: '4px 0' }} />}
                          </div>
                          <div style={{ flex: 1 }}>
                             <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>{c.userId?.name} <span style={{ fontWeight: '400', color: '#94A3B8' }}>submitted</span> {c.sessionId?.title}</div>
                             <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • SUBMITTED</div>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* MANDATORY REPORTS ANALYTICS SECTION */}
            <div style={{ background: '#fff', padding: '40px', borderRadius: '32px', border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)', marginTop: '40px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#1E293B', margin: 0 }}>Critical Incident Analytics</h3>
                    <p style={{ fontSize: '0.9rem', color: '#64748B', marginTop: '4px' }}>Consolidated metrics from all station mandatory reports</p>
                  </div>
                  <div style={{ background: '#F1F5F9', padding: '8px 16px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '700', color: '#475569' }}>Real-time Feed</div>
               </div>

               <div className='grid grid-cols-2' style={{ gap: '40px' }}>
                  <div style={{ background: '#FDF2F8', padding: '30px', borderRadius: '24px', border: '1px solid #FCE7F3' }}>
                     <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#BE185D', marginBottom: '25px' }}>Missing Cases Demographics</h4>
                     <div style={{ height: '140px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '15px' }}>
                        {['Man', 'Woman', 'Boy', 'Girl'].map((cat, idx) => {
                           const colors = ['#BE185D', '#DB2777', '#F472B6', '#FBCFE8'];
                           let totalCount = 0;
                           (mandatoryForms || []).forEach(f => {
                              const match = f.missingCases?.categories?.find(c => c.name === cat);
                              if(match) totalCount += (parseInt(match.details) || 0);
                           });
                           
                           // Calculate percentage based on max count to scale bars
                           const maxPossible = Math.max(...['Man', 'Woman', 'Boy', 'Girl'].map(c => {
                              let tc = 0;
                              (mandatoryForms || []).forEach(f => {
                                 const m = f.missingCases?.categories?.find(catMatch => catMatch.name === c);
                                 if(m) tc += (parseInt(m.details) || 0);
                              });
                              return tc;
                           }), 1);
                           const hPerc = (totalCount / maxPossible) * 100;

                           return (
                              <div key={cat} style={{ flex: 1, textAlign: 'center' }}>
                                 <div style={{ 
                                    background: colors[idx], 
                                    height: `${hPerc}%`, 
                                    borderRadius: '8px 8px 4px 4px', 
                                    position: 'relative', 
                                    transition: 'height 0.5s ease',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                 }}>
                                    <div style={{ position: 'absolute', top: '-22px', left: '50%', transform: 'translateX(-50%)', fontWeight: '800', fontSize: '0.75rem', color: '#BE185D' }}>{totalCount}</div>
                                 </div>
                                 <div style={{ marginTop: '10px', fontSize: '0.7rem', fontWeight: '700', color: '#BE185D' }}>{cat}</div>
                              </div>
                           );
                        })}
                     </div>
                  </div>

                  <div style={{ background: '#F8FAFC', padding: '30px', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
                     <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#020617', marginBottom: '20px' }}>Global Charge Sheet Output</h4>
                     <div style={{ height: '140px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '20px' }}>
                        {['60-Day', '90-Day', 'ITSSO'].map(type => {
                           let total = 0;
                           (mandatoryForms || []).forEach(f => {
                              const match = f.chargeSheet?.types?.find(t => t.name.includes(type));
                              if(match) total += (parseInt(match.count) || 0);
                           });
                           const maxHeight = 100;
                           const hPerc = Math.min((total / maxHeight) * 100, 100);
                           return (
                             <div key={type} style={{ flex: 1, textAlign: 'center' }}>
                                <div style={{ background: 'linear-gradient(to top, #1E293B, #475569)', height: `${hPerc}%`, borderRadius: '8px 8px 0 0', position: 'relative', transition: 'height 0.5s ease' }}>
                                   <div style={{ position: 'absolute', top: '-22px', left: '50%', transform: 'translateX(-50%)', fontWeight: '800', fontSize: '0.75rem', color: '#020617' }}>{total}</div>
                                </div>
                                <div style={{ marginTop: '10px', fontSize: '0.7rem', fontWeight: '700', color: '#64748B' }}>{type}</div>
                             </div>
                           );
                        })}
                     </div>
                  </div>
               </div>
            </div>

            {/* Form Utilization Overview */}
            <div style={{ background: '#fff', padding: '40px', borderRadius: '32px', border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)', marginTop: '40px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1E293B', margin: 0 }}>Form Performance & Utilization</h3>
                  <span style={{ fontSize: '0.8rem', background: '#F1F5F9', color: '#475569', padding: '4px 12px', borderRadius: '20px', fontWeight: '700' }}>
                    {sessions.length + 1} Active Schemas
                  </span>
               </div>
               
               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Mandatory Forms Row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', background: 'linear-gradient(90deg, #F8FAFC, #F1F5F9)', borderRadius: '16px', borderLeft: '6px solid #334155' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ background: '#EEF2FF', padding: '10px', borderRadius: '12px', color: '#334155' }}><ShieldAlert size={20}/></div>
                        <div>
                           <div style={{ fontWeight: '800', fontSize: '1rem', color: '#1E293B' }}>Mandatory Daily Report</div>
                           <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '600' }}>SYSTEM DEFAULT • RECURRING</div>
                        </div>
                     </div>
                     <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#1E293B' }}>{(mandatoryForms || []).length}</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '700' }}>TOTAL SUBMISSIONS</div>
                     </div>
                  </div>

                  {/* Normal Forms List */}
                  <div className="grid grid-cols-2" style={{ gap: '12px' }}>
                    {sessions.map((s, idx) => {
                       const count = cases.filter(c => c.sessionId?._id === s._id).length;
                       return (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', background: '#fff', borderRadius: '16px', border: '1px solid #F1F5F9', transition: 'all 0.2s hover', cursor: 'default' }}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ background: '#F8FAFC', padding: '10px', borderRadius: '12px', color: '#94A3B8' }}><FileText size={20}/></div>
                                <div>
                                   <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#334155' }}>{s.title}</div>
                                   <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Created {new Date(s.createdAt).toLocaleDateString()}</div>
                                </div>
                             </div>
                             <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#334155' }}>{count}</div>
                                <div style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: '700' }}>SUBMISSIONS</div>
                             </div>
                          </div>
                       );
                    })}
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* --- MANAGE FORMS TAB (WIZARD) --- */}
        {activeTab === 'forms' && (
          <div className="animate-fade-in">

            {/* â”€â”€ STEP 1: Title + Field Count â”€â”€ */}
            {wizardStep === 1 && (
              <div style={{ maxWidth: '560px', margin: '0 auto', background: '#fff', padding: '40px', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg,#1E293B,#334155)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><Plus size={28} color="#fff"/></div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0 }}>Create a New Form</h2>

                </div>
                <form onSubmit={handleWizardStep1}>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px' }}>Form Title</label>
                    <input className="form-input" style={{ width: '100%' }} placeholder="e.g. Daily Incident Log" value={wizardTitle} onChange={e => setWizardTitle(e.target.value)} required />
                  </div>
                  <div style={{ marginBottom: '28px' }}>
                    <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px' }}>No of fields</label>
                    <input className="form-input" style={{ width: '100%' }} type="number" min="1" max="30" placeholder="e.g. 4" value={wizardFieldCount} onChange={e => setWizardFieldCount(e.target.value)} required />
                  </div>
                  {wizardError && <p style={{ color:'#EF4444', marginBottom:'16px', fontSize:'0.9rem' }}>{wizardError}</p>}
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem' }}>Create</button>
                </form>
              </div>
            )}

            {/* â”€â”€ STEP 2: Build Each Field â”€â”€ */}
            {wizardStep === 2 && (
              <div style={{ maxWidth: '760px', margin: '0 auto' }}>
                <div style={{ background: '#fff', padding: '30px', borderRadius: '20px', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800' }}>ðŸ“‹ {wizardTitle}</h2>
                    <span style={{ background: '#E2E8F0', color: '#1E40AF', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700' }}>{wizardFields.length} Fields</span>
                  </div>

                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                  {wizardFields.map((field, i) => (
                    <div key={i} style={{ background: '#fff', padding: '24px', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg,#1E293B,#334155)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '0.8rem', flexShrink: 0 }}>{i + 1}</div>
                        <span style={{ fontWeight: '700', fontSize: '1rem' }}>Field {i + 1}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <div>
                          <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '5px' }}>Field Label (Question Text) *</label>
                          <input className="form-input" placeholder="e.g. Incident Type" value={field.label} onChange={e => handleWizardFieldChange(i, 'label', e.target.value)} required />
                          
                          <div style={{ marginTop: '10px' }}>
                            <label style={{ display: 'block', fontWeight: '600', fontSize: '0.75rem', color: '#64748B', marginBottom: '5px' }}>Add Image to Question (Optional)</label>
                            <input type="file" accept="image/*" style={{ fontSize: '0.8rem' }} onChange={async (e) => {
                              const file = e.target.files[0];
                              if (!file) return;
                              const fd = new FormData();
                              fd.append('image', file);
                              try {
                                const res = await axios.post('/api/upload', fd, {
                                  headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'multipart/form-data' }
                                });
                                handleWizardFieldChange(i, 'labelImage', res.data.url);
                              } catch (err) { // eslint-disable-line no-unused-vars
 console.error(err); alert('Upload failed'); }
                            }} />
                            {field.labelImage && (
                              <div style={{ marginTop: '5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <img src={field.labelImage} alt="Preview" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                <button onClick={() => handleWizardFieldChange(i, 'labelImage', '')} style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '0.7rem', cursor: 'pointer' }}>Remove</button>
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '5px' }}>Field Type</label>
                          <select className="form-select" value={field.fieldType} onChange={e => handleWizardFieldChange(i, 'fieldType', e.target.value)}>
                            <option value="text">Short Text</option>
                            <option value="textarea">Long Text</option>
                            <option value="number">Number</option>
                            <option value="date">Date</option>
                            <option value="dropdown">Dropdown</option>
                            <option value="boolean">Yes / No Question</option>
                            <option value="truefalse">True / False Question</option>
                            <option value="filetext">Image + Description Question</option>
                            <option value="file">Image Upload</option>
                          </select>
                        </div>
                      </div>
                      {field.fieldType === 'dropdown' && (
                        <div style={{ marginTop: '12px' }}>
                          <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '5px' }}>Options <span style={{ color:'#94A3B8' }}>(comma-separated)</span></label>
                          <input className="form-input" style={{ width: '100%' }} placeholder="e.g. Open, Closed, Pending" value={field.options} onChange={e => handleWizardFieldChange(i, 'options', e.target.value)} />
                        </div>
                      )}
                      <div style={{ marginTop: '12px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' }}>
                          <input type="checkbox" checked={field.isRequired} onChange={e => handleWizardFieldChange(i, 'isRequired', e.target.checked)} />
                          Required field
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                {wizardError && <p style={{ color:'#EF4444', marginBottom:'16px', textAlign:'center', fontWeight:'600' }}>{wizardError}</p>}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => { setWizardStep(1); setWizardError(''); }} className="btn btn-secondary" style={{ width: 'auto', padding: '14px 28px' }}>â† Back</button>
                  <button onClick={handleWizardPublish} disabled={wizardPublishing} className="btn btn-primary" style={{ flex: 1, padding: '14px', fontSize: '1rem' }}>
                    {wizardPublishing ? 'Publishing...' : 'âœ… Done â€” Publish Form to All Users'}
                  </button>
                </div>
              </div>
            )}

            {/* â”€â”€ STEP 3: Success â”€â”€ */}
            {wizardStep === 3 && (
              <div style={{ maxWidth: '480px', margin: '0 auto', background: '#fff', padding: '50px 40px', borderRadius: '20px', border: '1px solid #E2E8F0', textAlign: 'center', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '4rem', marginBottom: '16px' }}>ðŸŽ‰</div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#059669', marginBottom: '12px' }}>Form Published!</h2>
                <p style={{ color: '#64748B', marginBottom: '8px', fontSize: '1rem' }}><strong>{wizardTitle}</strong> is now live and visible to all station users.</p>
                <p style={{ color: '#94A3B8', marginBottom: '32px', fontSize: '0.9rem' }}>Users can fill and submit it from their dashboard.</p>
                <button onClick={resetWizard} className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem' }}>+ Create Another Form</button>
              </div>
            )}

            {/* â”€â”€ Published Forms Table â”€â”€ */}
            {wizardStep !== 2 && sessions.length > 0 && (
              <div style={{ marginTop: '40px', background: '#fff', padding: '30px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <h3 style={{ marginBottom: '20px', fontWeight: '700' }}>Published Forms ({sessions.length})</h3>
                <div className="table-container">
                  <table className="styled-table">
                    <thead><tr><th>Form Title</th><th>Hosted By</th><th>Fields</th><th>Code</th><th>Created At</th><th>Delete</th></tr></thead>
                    <tbody>
                      {sessions.map(s => (
                        <tr key={s._id}>
                          <td style={{ fontWeight: '600' }}>{s.title}</td>
                          <td style={{ fontSize: '0.85rem' }}>{s.creator?.name || 'Admin'}</td>
                          <td>{(Array.isArray(s.fields) ? s.fields.length : 0)} fields</td>
                          <td><span style={{ background: '#F1F5F9', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>#{s.sessionNo}</span></td>
                          <td style={{ fontSize: '0.85rem', color: '#64748B' }}>{new Date(s.createdAt).toLocaleDateString()}</td>
                          <td><button onClick={() => handleDeleteSession(s._id)} style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer' }}><Trash2 size={16}/></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- RESPONSE MANAGEMENT TAB --- */}
        {activeTab === 'responses' && (
          <div className="animate-fade-in">
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                   <Filter size={20} color="#64748B"/>
                   <span style={{ fontWeight: '600' }}>Filter by Form:</span>
                   <select className="form-select" style={{ width: '220px' }} value={responseFilter} onChange={e => setResponseFilter(e.target.value)}>
                      <option value="all">View All Submissions</option>
                      {sessions.map(s => <option key={s._id} value={s._id}>{s.title} ({s.sessionNo})</option>)}
                   </select>

                   <div style={{ display: 'flex', alignItems: 'center', background: '#F1F5F9', padding: '8px 15px', borderRadius: '10px', width: '300px', marginLeft: '10px' }}>
                     <Search size={18} color="#64748B" style={{ marginRight: '10px' }} />
                     <input 
                       type="text" 
                       placeholder="Search responses (Name, Email, Content)..." 
                       value={responseSearch} 
                       onChange={e => setResponseSearch(e.target.value)} 
                       style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem' }} 
                     />
                   </div>
                </div>
                <button onClick={handleExportCSV} className="btn btn-primary" style={{ width: 'auto' }}><Download size={18}/> Export Results</button>
             </div>

             <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '30px' }}>
               <div className="table-container">
                 <table className="styled-table">
                    <thead>
                       <tr style={{ textAlign: 'left' }}>
                          <th style={{ padding: '15px' }}>Submitted By</th>
                          <th>Form Session</th>
                          <th>Data Preview</th>
                          <th>Submission Date</th>
                          <th style={{ textAlign: 'center' }}>Details</th>
                       </tr>
                    </thead>
                    <tbody>
                      {filteredCases.map(c => (
                        <tr key={c._id}>
                           <td style={{ padding: '15px' }}>
                              <div style={{ fontWeight: '700' }}>{c.userId?.name}</div>
                              <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{c.userId?.email}</div>
                           </td>
                           <td>
                              <div style={{ fontWeight: '600' }}>{c.sessionId?.title || 'General'}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Hosted by: {c.sessionId?.creator?.name || 'System'}</div>
                           </td>
                           <td>
                              <div style={{ maxWidth: '200px', overflow: 'hidden', fontSize: '0.85rem' }}>
                                 {(() => {
                                   let d = c.data;
                                   if (typeof d === 'string') try { d = JSON.parse(d); } catch (err) { // eslint-disable-line no-unused-vars
 d = {}; }
                                   return Object.entries(d || {}).slice(0, 2).map(([k, v]) => (
                                     <div key={k}>{k}: {v?.toString().substring(0, 20)}...</div>
                                   ));
                                 })()}
                              </div>
                           </td>
                           <td><span style={{ fontSize: '0.9rem', color: '#64748B' }}>{new Date(c.createdAt).toLocaleString()}</span></td>
                           <td style={{ textAlign: 'center' }}>
                              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                 
                                 
                                 <button onClick={() => {
                                   let d = c.data;
                                   if (typeof d === 'string') try { d = JSON.parse(d); } catch (err) { // eslint-disable-line no-unused-vars
 d = {}; }
                                   setSelectedFile({ type: 'json', data: JSON.stringify(d) });
                                 }} style={{ background: '#E2E8F0', color: '#0F172A', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>View Full Response</button>
                              </div>
                           </td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
               </div>
             </div>
          </div>
         )}

        {/* --- MANDATORY REPORTS TAB --- */}
        {activeTab === 'mandatory' && (
          <div className="animate-fade-in">
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
                   <Search size={20} color="#64748B"/>
                   <input type="text" placeholder="Search forms (e.g., 'boys missing details')..." value={mandatorySearch} onChange={e => setMandatorySearch(e.target.value)} style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '1rem' }} />
                </div>
                <button onClick={() => {
                   const csvRows = ['Date,User Name,Email,Charge Sheet 60-Day,90-Day,ITSSO,Total Filed,Missing Year,Man,Woman,Boy,Girl,Total Missing,Fatal,Non-Fatal,Total Accidents'];
                   filteredMandatory.forEach(m => {
                      const getCSCount = (n) => m.chargeSheet?.types.find(t=>t.name===n)?.count || 0;
                      const getMSDetail = (n) => `"${m.missingCases?.categories.find(t=>t.name===n)?.details?.replace(/"/g, '""') || ''}"`;
                      const getRA = (n) => `"${m.roadAccident?.types.find(t=>t.name===n)?.details?.replace(/"/g, '""') || ''}"`;
                      csvRows.push([
                         new Date(m.date).toLocaleDateString(), m.userId?.name, m.userId?.email,
                         getCSCount('60-Day Charge Sheet'), getCSCount('90-Day Charge Sheet'), getCSCount('ITSSO Charge Sheet'),
                         m.chargeSheet?.totalFiled || 0, m.missingCases?.year || '',
                         getMSDetail('Man'), getMSDetail('Woman'), getMSDetail('Boy'), getMSDetail('Girl'),
                         m.missingCases?.totalCount || 0, getRA('Fatal'), getRA('Non-Fatal'), m.roadAccident?.totalCount || 0
                      ].join(','));
                   });
                   const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
                   const url = window.URL.createObjectURL(blob);
                   const a = document.createElement('a'); a.setAttribute('href', url); a.setAttribute('download', 'Mandatory_Reports.csv'); a.click();
                }} className="btn btn-primary" style={{ width: 'auto' }}><Download size={18}/> Export Mandatory Reports</button>
             </div>

             {/* STAT CARDS (Style 1) */}
             <div className="grid grid-cols-3" style={{ gap: '20px', marginBottom: '30px' }}>
               <div style={{ background: '#fff', padding: '25px', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ background: '#E2E8F0', padding: '15px', borderRadius: '12px', color: '#0F172A' }}><FileText size={32} /></div>
                  <div><div style={{ fontSize: '1.8rem', fontWeight: '800' }}>{mandatoryForms.reduce((acc, curr) => acc + (curr.chargeSheet?.totalFiled || 0), 0)}</div><div style={{ fontSize: '0.9rem', color: '#64748B' }}>Total Charge Sheets Filed</div></div>
               </div>
               <div style={{ background: '#fff', padding: '25px', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ background: '#FCE7F3', padding: '15px', borderRadius: '12px', color: '#BE185D' }}><Users size={32} /></div>
                  <div><div style={{ fontSize: '1.8rem', fontWeight: '800' }}>{mandatoryForms.reduce((acc, curr) => acc + (curr.missingCases?.totalCount || 0), 0)}</div><div style={{ fontSize: '0.9rem', color: '#64748B' }}>Total Missing Cases</div></div>
               </div>
               <div style={{ background: '#fff', padding: '25px', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ background: '#FEF3C7', padding: '15px', borderRadius: '12px', color: '#B45309' }}><ShieldAlert size={32} /></div>
                  <div><div style={{ fontSize: '1.8rem', fontWeight: '800' }}>{mandatoryForms.reduce((acc, curr) => acc + (curr.roadAccident?.totalCount || 0), 0)}</div><div style={{ fontSize: '0.9rem', color: '#64748B' }}>Total Road Accidents</div></div>
               </div>
             </div>

             <div className="grid grid-cols-2" style={{ gap: '20px', marginBottom: '30px' }}>
               {/* BAR CHART: Charge Sheet Comparison (Style 2) */}
               <div style={{ background: '#fff', padding: '30px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                 <h3 style={{ marginBottom: '20px', fontSize: '1.1rem', fontWeight: '700' }}>Charge Sheet Type Breakdown</h3>
                 <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '200px', borderBottom: '2px solid #E2E8F0', paddingBottom: '10px' }}>
                   {['60-Day Charge Sheet', '90-Day Charge Sheet', 'ITSSO Charge Sheet'].map(type => {
                     const total = mandatoryForms.reduce((acc, m) => acc + (m.chargeSheet?.types.find(t=>t.name===type)?.count || 0), 0);
                     const max = Math.max(1, ...['60-Day Charge Sheet', '90-Day Charge Sheet', 'ITSSO Charge Sheet'].map(t => mandatoryForms.reduce((acc, m) => acc + (m.chargeSheet?.types.find(tt=>tt.name===t)?.count || 0), 0)));
                     return (
                       <div key={type} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '30%' }}>
                         <div style={{ height: `${(total/max)*150}px`, width: '100%', background: 'linear-gradient(to top, #1E293B, #64748B)', borderRadius: '6px 6px 0 0', position: 'relative' }}>
                           <span style={{ position: 'absolute', top: '-20px', width: '100%', textAlign: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>{total}</span>
                         </div>
                         <div style={{ fontSize: '0.75rem', textAlign: 'center', fontWeight: '600', color: '#475569' }}>{type.split(' ')[0]}</div>
                       </div>
                     )
                   })}
                 </div>
               </div>

               {/* PROGRESS BARS: Missing Cases Demographics (Style 3) */}
               <div style={{ background: '#fff', padding: '30px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                 <h3 style={{ marginBottom: '20px', fontSize: '1.1rem', fontWeight: '700' }}>Missing Cases Demographics</h3>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                   {['Man', 'Woman', 'Boy', 'Girl'].map((type, i) => {
                     const colors = ['#1E293B', '#EC4899', '#8B5CF6', '#F59E0B'];
                     const count = mandatoryForms.reduce((acc, m) => acc + (m.missingCases?.categories.find(t=>t.name===type) ? 1 : 0), 0);
                     const totalCases = Math.max(1, mandatoryForms.length);
                     const percent = (count/totalCases) * 100;
                     return (
                       <div key={type}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '5px', fontWeight: '600' }}>
                           <span>{type}</span><span>{count} Reports</span>
                         </div>
                         <div style={{ width: '100%', height: '12px', background: '#F1F5F9', borderRadius: '6px', overflow: 'hidden' }}>
                           <div style={{ width: `${percent}%`, height: '100%', background: colors[i], borderRadius: '6px' }}></div>
                         </div>
                       </div>
                     )
                   })}
                 </div>
               </div>
             </div>

             <div className="grid grid-cols-2" style={{ gap: '20px', marginBottom: '30px' }}>
               {/* DOUGHNUT CHART SIMULATION: Road Accidents (Style 4) */}
               <div style={{ background: '#fff', padding: '30px', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center' }}>
                  {(() => {
                    let fatalCount = 0;
                    let nonFatalCount = 0;
                    mandatoryForms.forEach(m => {
                      const fatal = m.roadAccident?.types?.find(t => t.name === 'Fatal');
                      const nonFatal = m.roadAccident?.types?.find(t => t.name === 'Non-Fatal');
                      fatalCount += parseInt(fatal?.details) || 0;
                      nonFatalCount += parseInt(nonFatal?.details) || 0;
                    });
                    const totalAccidents = fatalCount + nonFatalCount;
                    const fatalPerc = totalAccidents > 0 ? (fatalCount / totalAccidents) * 100 : 0;
                    
                    return (
                      <>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ marginBottom: '10px', fontSize: '1.1rem', fontWeight: '700' }}>Road Accident Severity</h3>
                          <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '20px' }}>Actual count of fatal vs non-fatal accidents reported.</p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                               <div style={{ width: '15px', height: '15px', background: '#EF4444', borderRadius: '4px' }}></div> 
                               <span style={{fontSize:'0.9rem', fontWeight:'600'}}>Fatal Accidents: {fatalCount}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                               <div style={{ width: '15px', height: '15px', background: '#F59E0B', borderRadius: '4px' }}></div> 
                               <span style={{fontSize:'0.9rem', fontWeight:'600'}}>Non-Fatal Accidents: {nonFatalCount}</span>
                            </div>
                          </div>
                        </div>
                        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                           <div style={{ width: '150px', height: '150px', borderRadius: '50%', background: `conic-gradient(#EF4444 0% ${fatalPerc}%, #F59E0B 0 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                             <div style={{ width: '100px', height: '100px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{totalAccidents}</span>
                                <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Total Accidents</span>
                             </div>
                           </div>
                        </div>
                      </>
                    );
                  })()}
               </div>

               {/* TIMELINE / LIST VIEW (Style 5) */}
               <div style={{ background: '#fff', padding: '30px', borderRadius: '16px', border: '1px solid #E2E8F0', maxHeight: '300px', overflowY: 'auto' }}>
                 <h3 style={{ marginBottom: '20px', fontSize: '1.1rem', fontWeight: '700' }}>Recent Mandatory Activity</h3>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                   {mandatoryForms.slice(0, 5).map(m => (
                     <div key={m._id} style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                       <div style={{ width: '40px', height: '40px', background: '#F1F5F9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontWeight: 'bold' }}>{m.userId?.name?.charAt(0)}</div>
                       <div>
                         <div style={{ fontSize: '0.95rem', fontWeight: '600' }}>{m.userId?.name} <span style={{fontWeight:'normal', color:'#64748B'}}>submitted daily report</span></div>
                         <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{new Date(m.date).toLocaleDateString()} &middot; {m.chargeSheet?.totalFiled} Charge Sheets, {m.missingCases?.totalCount} Missing</div>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             </div>

             {/* DETAILED DATA TABLE (Style 6) */}
             <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '30px' }}>
                <h3 style={{ marginBottom: '20px', fontSize: '1.1rem', fontWeight: '700' }}>Comprehensive Reporting Data</h3>
                <div className="table-container">
                   <table className="styled-table">
                      <thead>
                         <tr>
                            <th>Date & User</th>
                            <th>Charge Sheets</th>
                            <th>Missing Cases</th>
                            <th>Road Accidents</th>
                         </tr>
                      </thead>
                      <tbody>
                         {filteredMandatory.map(m => (
                           <tr key={m._id}>
                              <td>
                                <div style={{ fontWeight: 'bold' }}>{new Date(m.date).toLocaleDateString()}</div>
                                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{m.userId?.name}</div>
                              </td>
                              <td style={{ fontSize: '0.85rem' }}>
                                Total: <strong>{m.chargeSheet?.totalFiled}</strong><br/>
                                {m.chargeSheet?.types.map(t => <span key={t.name} style={{background:'#E2E8F0', color:'#1D4ED8', padding:'2px 6px', borderRadius:'4px', marginRight:'5px', fontSize:'0.7rem', display:'inline-block', marginTop:'2px'}}>{t.name.split(' ')[0]}: {t.count}</span>)}
                              </td>
                              <td style={{ fontSize: '0.85rem' }}>
                                Total: <strong>{m.missingCases?.totalCount}</strong><br/>
                                {m.missingCases?.categories.map(t => <div key={t.name} style={{color:'#BE185D', fontSize:'0.75rem', marginTop:'2px'}}><b>{t.name}:</b> {t.details}</div>)}
                              </td>
                              <td style={{ fontSize: '0.85rem' }}>
                                Total: <strong>{m.roadAccident?.totalCount}</strong><br/>
                                {m.roadAccident?.types.map(t => <div key={t.name} style={{color:'#B45309', fontSize:'0.75rem', marginTop:'2px'}}><b>{t.name}:</b> {t.details}</div>)}
                              </td></tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        )}

        {/* --- USER MANAGEMENT TAB --- */}
        {activeTab === 'users' && (
          <div className="animate-fade-in">
             <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '30px' }}>
                <h3 style={{ marginBottom: '25px' }}>Registered Portal Users</h3>
                <div className="table-container">
                   <table className="styled-table">
                      <thead>
                         <tr>
                            <th>User Name</th>
                            <th>Email Address</th>
                            <th>Current Role</th>
                            <th>Modify Access</th>
                         </tr>
                      </thead>
                      <tbody>
                         {usersList.map(u => (
                           <tr key={u._id}>
                              <td style={{ fontWeight: '600' }}>{u.name}</td>
                              <td>{u.email}</td>
                              <td><span style={{ background: u.role === 'admin' ? '#E0E7FF' : '#F3F4F6', color: u.role === 'admin' ? '#4338CA' : '#4B5563', padding: '4px 10px', borderRadius: '8px', fontWeight: 'bold', fontSize:'0.85rem' }}>{u.role.toUpperCase()}</span></td>
                              <td>
                                 <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                                   <select className="form-select" style={{ fontSize: '0.8rem', padding: '5px', width:'150px' }} value={u.role} onChange={(e) => handleUpdateUserRole(u._id, e.target.value)}>
                                      <option value="station">Station User</option>
                                      <option value="admin">Global Admin</option>
                                      <option value="ccrb">CCRB Officer</option>
                                   </select>
                                   <ChevronRight size={16} color="#94A3B8"/>
                                 </div>
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
