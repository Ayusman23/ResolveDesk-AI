const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Ticket = require('./models/Ticket');
const { calculateDeadline, predictSlaRisk } = require('./services/slaPredictor');

dotenv.config();

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/deskflow_ai';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Ticket.deleteMany({});
    console.log('[Seed] Cleared old users and tickets');

    // Create Demo Users
    const clientUser = await User.create({
      name: 'Alice Henderson',
      email: 'alice.client@enterprise.corp',
      password: 'password123',
      role: 'client',
      department: 'Marketing & Sales',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    });

    const clientUser2 = await User.create({
      name: 'Bob Chen',
      email: 'bob.chen@enterprise.corp',
      password: 'password123',
      role: 'client',
      department: 'Operations',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    });

    const devUser = await User.create({
      name: 'Sarah Connor (Senior SRE)',
      email: 'dev.sarah@enterprise.corp',
      password: 'password123',
      role: 'developer',
      department: 'Cloud Infrastructure',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    });

    const devUser2 = await User.create({
      name: 'Alex Rivera (IT Engineer)',
      email: 'dev.alex@enterprise.corp',
      password: 'password123',
      role: 'developer',
      department: 'IT Systems & Security',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    });

    const managerUser = await User.create({
      name: 'David Vance (IT Director)',
      email: 'manager.david@enterprise.corp',
      password: 'password123',
      role: 'manager',
      department: 'Executive IT Operations',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    });

    console.log('[Seed] Created 5 Demo Users');

    // Seed Tickets with realistic ITSM scenarios
    const demoTickets = [
      {
        title: 'VPN Gateway 10.45.0.1 unreachable after firmware patch',
        rawDescription: 'Cannot connect to London datacenter VPN. My credentials are alice.client@enterprise.corp and my temporary token was bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        sanitizedDescription: 'Cannot connect to London datacenter VPN. My credentials are [REDACTED_EMAIL] and my temporary token was bearer [REDACTED_SECRET]...',
        status: 'In Progress',
        priority: 'Critical',
        category: 'Network',
        createdBy: clientUser._id,
        assignedTo: devUser._id,
        aiConfidence: 0.94,
        piiEntitiesFound: [
          { entityType: 'EMAIL', originalValueLength: 28, redactedWith: '[REDACTED_EMAIL]' },
          { entityType: 'API_KEY_OR_SECRET', originalValueLength: 45, redactedWith: '[REDACTED_SECRET]' },
        ],
        suggestedRemediation: 'Reboot Cisco ASA Gateway 10.45.0.1 and rollback SSL-VPN certificate bundle to revision #4402.',
        agenticFallbackTriggered: false,
        deviceContext: {
          os: 'Windows 11 Enterprise (Build 22631)',
          browser: 'Chrome 124.0.6367.91',
          screenResolution: '2560x1440',
          ipAddress: '192.168.1.144',
          networkType: 'Ethernet Gigabit',
        },
        internalDevNotes: [
          {
            author: devUser._id,
            authorName: devUser.name,
            text: 'Investigating ASA routing table. DNS resolution is failing on secondary tunnel interface.',
          },
        ],
      },
      {
        title: 'MacBook Pro M3 screen flickering and kernel panics',
        rawDescription: 'My workstation monitor turns pink and shuts off whenever connected to the USB-C dock in conference room B.',
        sanitizedDescription: 'My workstation monitor turns pink and shuts off whenever connected to the USB-C dock in conference room B.',
        status: 'Open',
        priority: 'Medium',
        category: 'Hardware',
        createdBy: clientUser2._id,
        assignedTo: devUser2._id,
        aiConfidence: 0.88,
        piiEntitiesFound: [],
        suggestedRemediation: 'DisplayPort alt-mode firmware update required for CalDigit Thunderbolt 4 dock.',
        agenticFallbackTriggered: false,
        deviceContext: {
          os: 'macOS Sonoma 14.4.1',
          browser: 'Safari 17.4',
          screenResolution: '3024x1964',
          ipAddress: '10.0.4.52',
          networkType: 'Wi-Fi 6E',
        },
        internalDevNotes: [],
      },
      {
        title: 'Production AWS IAM Role escalation request for Q3 financial audit',
        rawDescription: 'Need ReadOnlyAccess to s3://enterprise-finance-data-bucket-prod. My AWS access key was AKIAIOSFODNN7EXAMPLE and secret was wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY.',
        sanitizedDescription: 'Need ReadOnlyAccess to s3://enterprise-finance-data-bucket-prod. My AWS access key was [REDACTED_SECRET] and secret was [REDACTED_SECRET].',
        status: 'Open',
        priority: 'High',
        category: 'Access',
        createdBy: clientUser._id,
        assignedTo: null,
        aiConfidence: 0.91,
        piiEntitiesFound: [
          { entityType: 'API_KEY_OR_SECRET', originalValueLength: 20, redactedWith: '[REDACTED_SECRET]' },
          { entityType: 'API_KEY_OR_SECRET', originalValueLength: 40, redactedWith: '[REDACTED_SECRET]' },
        ],
        suggestedRemediation: 'Generate temporary STS assume-role session token with 4-hour TTL and MFA verification requirement.',
        agenticFallbackTriggered: false,
        deviceContext: {
          os: 'Windows 11 Pro',
          browser: 'Firefox 125.0',
          screenResolution: '1920x1080',
          ipAddress: '172.16.0.88',
          networkType: 'VPN Tunnel',
        },
        internalDevNotes: [],
      },
      {
        title: 'Unusual outbound HTTP POST spikes to unrecognized foreign IP',
        rawDescription: 'CrowdStrike Falcon detected beaconing on endpoint host-fin-04 to IP 185.220.101.5 on port 8443.',
        sanitizedDescription: 'CrowdStrike Falcon detected beaconing on endpoint host-fin-04 to IP 185.220.101.5 on port 8443.',
        status: 'In Progress',
        priority: 'Critical',
        category: 'Security',
        createdBy: clientUser2._id,
        assignedTo: devUser._id,
        aiConfidence: 0.96,
        piiEntitiesFound: [],
        suggestedRemediation: 'Isolate endpoint host-fin-04 from subnet, capture memory dump via Volatility, and revoke Kerberos TGT.',
        agenticFallbackTriggered: false,
        deviceContext: {
          os: 'Linux Ubuntu 22.04 LTS',
          browser: 'Headless / Agent',
          screenResolution: 'Headless',
          ipAddress: '10.50.2.19',
          networkType: 'VLAN 50 (Finance)',
        },
        internalDevNotes: [
          {
            author: devUser._id,
            authorName: devUser.name,
            text: 'Endpoint quarantined via EDR API. Analyzing suspicious PowerShell encoded payload.',
          },
        ],
      },
      {
        title: 'Legacy Cobol ERP reporting export crashing on month-end close',
        rawDescription: 'Export to CSV fails with cryptic error code ERR_MEM_0x899014 during table batch aggregation.',
        sanitizedDescription: 'Export to CSV fails with cryptic error code ERR_MEM_0x899014 during table batch aggregation.',
        status: 'Open',
        priority: 'Medium',
        category: 'Software',
        createdBy: clientUser._id,
        assignedTo: null,
        aiConfidence: 0.58, // Low confidence -> triggers Agentic Fallback!
        piiEntitiesFound: [],
        suggestedRemediation: 'Simulated documentation fallback: Legacy Oracle-Cobol connector buffer size should be increased in config/export.ini.',
        agenticFallbackTriggered: true,
        agenticSearchSources: [
          {
            title: 'Legacy ERP Technical Runbook: Memory Overflow during Batch CSV Extraction',
            source: 'Enterprise Architecture Archive (v4.2)',
            url: 'https://docs.enterprise.corp/runbooks/legacy-erp-mem-overflow',
            relevanceScore: 0.89,
          },
          {
            title: 'StackOverflow Enterprise: Fixing 0x899014 buffer allocation in ODBC connectors',
            source: 'StackOverflow Enterprise',
            url: 'https://stackoverflow.corp/questions/899014',
            relevanceScore: 0.78,
          },
        ],
        deviceContext: {
          os: 'Windows 10 Enterprise',
          browser: 'Edge 124.0.2478.67',
          screenResolution: '1920x1080',
          ipAddress: '10.0.12.33',
          networkType: 'Corporate Wi-Fi',
        },
        internalDevNotes: [],
      },
      {
        title: 'Conference Room 4A Polycom Video Bar microphone distorted',
        rawDescription: 'Echo and robotic audio during executive board meeting video calls.',
        sanitizedDescription: 'Echo and robotic audio during executive board meeting video calls.',
        status: 'Resolved',
        priority: 'Low',
        category: 'Hardware',
        createdBy: clientUser2._id,
        assignedTo: devUser2._id,
        aiConfidence: 0.90,
        piiEntitiesFound: [],
        suggestedRemediation: 'Factory reset Poly Studio X50 and reload Zoom Room appliance configuration.',
        agenticFallbackTriggered: false,
        deviceContext: {
          os: 'Android 12 (Poly OS)',
          browser: 'Embedded Zoom Room',
          screenResolution: '3840x2160',
          ipAddress: '10.20.1.10',
          networkType: 'PoE Ethernet',
        },
        internalDevNotes: [
          {
            author: devUser2._id,
            authorName: devUser2.name,
            text: 'Replaced shielded Cat6 cable and updated Polycom DSP firmware. Audio clarity verified at 100%.',
          },
        ],
      },
    ];

    for (const item of demoTickets) {
      const { deadline, hours } = calculateDeadline(item.priority);
      const risk = predictSlaRisk(
        {
          priority: item.priority,
          category: item.category,
          createdAt: new Date(),
          slaDeadline: deadline,
          agenticFallbackTriggered: item.agenticFallbackTriggered,
          status: item.status,
        },
        demoTickets.length,
        2
      );

      await Ticket.create({
        ...item,
        slaDeadline: deadline,
        slaHours: hours,
        slaRiskScore: risk.score,
        slaRiskLevel: risk.level,
        telemetryLogs: [
          { step: 'CONTEXT_INDEXING', status: 'COMPLETED', details: 'Client telemetry indexed.' },
          { step: 'PII_REDACTION', status: 'COMPLETED', details: 'PII scan completed.' },
          { step: 'NLP_TRIAGE', status: 'COMPLETED', details: `Classified as ${item.category} (${item.priority}).` },
          { step: 'SLA_PREDICTION', status: 'COMPLETED', details: `SLA Risk: ${risk.score}/100.` },
        ],
      });
    }

    console.log(`[Seed] Seeded ${demoTickets.length} enterprise tickets with full novel feature metadata.`);
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedData();
