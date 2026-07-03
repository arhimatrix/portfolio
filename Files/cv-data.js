// Centralized academic data for Nina Velimirovic
// Structured to allow easy updates and prevent hardcoding in index.html

window.CVData = {
  personal: {
    name: "Nina Velimirovic",
    title: "Architect · Human–Machine Collaboration Researcher · Robotics & Computational Design",
    email: "nina_velimirovic@yahoo.com",
    phone: "+33 6 87 42 06 94",
    location: "Strasbourg, France",
    linkedin: "linkedin.com/in/nina-v-6b03715",
    github: "github.com/ninavelimirovic",
    orcid: "0009-0002-1234-5678",
    profileText: "Architect and Human-Machine Collaboration researcher with over a decade of delivery on billion-dollar automated environments where machine systems and humans share physical and cognitive space — from the $5B Tel Aviv Red Line LRT (driverless underground transit) to NEOM’s zero-carbon urban mobility network. MSc research at the International Space University applies EEG neurophysiological monitoring, spatial behavioral mapping, and ergonomic auditing to evaluate how humans perform and navigate in robot-inhabited environments. Research addresses core HRC themes: adaptive task planning, wearable supervisory interfaces, real-time digital twins, and autonomous coordination logic with human-in-the-loop override. Proficient in Python, C#, ROS, UE5/AirSim, and MBSE — with hands-on prototyping of physical swarm hardware and user study design across analog astronaut and construction-site HRC contexts."
  },
  
  skills: [
    { name: "Python", category: "software", level: 90 },
    { name: "C# / .NET", category: "software", level: 80 },
    { name: "Grasshopper / Rhino 8", category: "software", level: 95 },
    { name: "ROS (Robot Operating System)", category: "robotics", level: 85 },
    { name: "Unreal Engine 5 / AirSim", category: "simulation", level: 90 },
    { name: "Real-Time Digital Twins", category: "simulation", level: 88 },
    { name: "Agentic AI / LLM APIs", category: "software", level: 85 },
    { name: "User Study Design & Evaluation", category: "research", level: 82 },
    { name: "EEG / Human Performance Auditing", category: "research", level: 82 },
    { name: "Wearable Interface Design", category: "research", level: 78 },
    { name: "Systems Engineering (MBSE/STK)", category: "robotics", level: 78 },
    { name: "Revit / BIM & Navisworks", category: "design", level: 92 }
  ],
  
  chapters: [
    {
      id: "chapter6",
      num: 1,
      title: "Human-Machine Collaboration & Sentient Infrastructure",
      subtitle: "EuroMoonMars Lunar Village · Adaptive Human-Robot Interface",
      theme: "Wearable sensor-driven interfaces, decentralised adaptive control, and human-in-the-loop supervisory systems",
      summary: "Proposed the architectural masterplan and human-machine interface architecture for a permanent 100-person Moon Village in partnership with EuroMoonMars. Engineered decentralised control loops, wearable-sensor-responsive spatial skins, and supervisory override interfaces governing human-habitat-robot interaction across surface, subsurface, and orbital stations.",
      bullets: [
        "Designed SAMI — a wearable-sensor-informed kinetic architectural skin: reads occupant biometric and movement data in real time to adapt spatial configuration, luminance, and atmospheric zones.",
        "Engineered ‘Reflex Arc’ distributed control loops: rule-based autonomous agents regulating life-support, pressure zones, and spatial reconfiguration in response to physiological sensor input — with human supervisory override capability.",
        "Developed human-in-the-loop interface dashboards enabling crew to monitor robot task sequences, inspect autonomous decisions, and issue override commands across habitat zones.",
        "Coordinated with EuroMoonMars and Tohoku University Space Robotics Laboratory on robotic construction sequencing, HRC protocol design, and wearable interface validation in analog environments."
      ],
      tags: ["Human-Machine Collaboration", "SAMI Adaptive Interface", "Wearable Sensor Integration", "Supervisory Override Systems", "EuroMoonMars Research"],
      codeLabel: "PROTOCOL / REFLEX_HRC.PY",
      subfigLabel: "SAMI BIOMETRIC RESPONSE · ADAPTIVE HABITAT SKIN",
      code: "def reflex_hrc(zone, sensors, human_present):
    state = sensors.read_biometric(zone)
    if state.co2 > THRESH or state.breach:
        if not human_present(zone):
            seal(zone)  # autonomous response
        else:
            alert_crew(zone, state)  # human-in-the-loop
    sami_skin.adapt(zone, state.motion, state.strain)"
    },
    {
      id: "chapter1",
      num: 2,
      title: "NEOM Multimodal Mobility Hubs",
      subtitle: "Human-Machine Interface · Zero-Carbon Transit · Occupant Sensing",
      theme: "Human-in-the-loop transit systems, sensor-embedded public realm, and interface legibility in autonomous environments",
      summary: "Designed architectural, systems, and digital interface logic for multimodal mobility hubs within NEOM — environments where autonomous vehicles, robotic maintenance systems, and thousands of daily occupants share space. Developed the human-in-the-loop feedback layer: sensor networks communicating machine intent, safety states, and task sequences to occupants in real time.",
      bullets: [
        "Designed the human-machine interface layer for driverless interchange hubs: visual and spatial cues communicating robot intent, vehicle approach state, and safety zones to non-expert occupants.",
        "Developed integrated sensor networks and real-time spatial feedback systems for occupant flow monitoring, autonomous vehicle routing, and robotic maintenance scheduling.",
        "Directed wayfinding and pedestrian circulation design — applying user study methods to evaluate interface legibility and occupant behaviour response to automated system cues.",
        "Simulated occupant demand models and flow networks to optimise physical infrastructure footprint, evaluate human response to autonomous systems, and calibrate robotic maintenance routes."
      ],
      tags: ["Human-Machine Interface Design", "Occupant Sensing", "Driverless Infrastructure", "Real-Time Spatial Feedback", "User Study Methods"],
      codeLabel: "INFRASTRUCTURE / HMI_ROUTING.PY",
      subfigLabel: "SENSOR-EMBEDDED INTERCHANGE · OCCUPANT FLOW STATE",
      code: "def hmi_routing(hub, occupant, robot_fleet):
    intent = robot_fleet.broadcast_intent(hub.zones)
    display_safety_state(hub.signage, intent)
    path = find_clear_path(hub.graph, occupant.origin, occupant.dest)
    if hub.alert_active():
        notify_occupant(occupant, hub.override_message)
    return path"
    },
    {
      id: "chapter4",
      num: 3,
      title: "Distributed Exploration of Titan",
      subtitle: "9-Agent Swarm · Adaptive Task Planning · Full MBSE",
      theme: "Multi-agent coordination, adaptive task planning, human-supervisory interfaces, and high-fidelity swarm simulation",
      summary: "Project Lead and Simulation Lead for a cooperative swarm of nine autonomous hybrid agents designed for Titan’s prebiotic terrain mapping. Delivered full MBSE package, designed adaptive task-planning and leader-election algorithms, and prototyped a physical swarm with validated inter-agent communication. Conducted structured evaluation studies of coordination interface design and human override protocols.",
      bullets: [
        "Designed adaptive task-planning algorithms for real-time goal re-allocation between 9 agents based on sensor state, mission priority, and communication latency — with human supervisory override capability.",
        "Programmed consensus-coordination and leader-election protocols (delay-tolerant mesh) enabling cooperative swarm behaviour under communication disruption — a direct analogue to robotic construction-site HRC.",
        "Conducted structured evaluation studies of the swarm coordination interface, testing operator-override protocols and failure-recovery sequences against mission scenarios.",
        "Developed high-fidelity Titan atmospheric and terrain simulation in UE5/AirSim to validate swarm deployment; built physical rover + CrazyFlie drone prototype for inter-agent communication testing.",
        "Delivered full MBSE package: 35 requirements, FMECA matrix, mass/power/data link budgets, and DRL-trained agent behaviour models."
      ],
      tags: ["Adaptive Task Planning", "Swarm HRC Interface", "User Study Design", "UE5 Digital Twin", "ROS · MBSE"],
      codeLabel: "SWARM / ADAPTIVE_TASK.PY",
      subfigLabel: "LEADER ELECTION · COOPERATIVE TASK ALLOCATION GRID",
      code: "def adaptive_task_planning(agents, mission_state):
    leader = elect_leader(agents, signal_quality)
    for agent in agents:
        task = leader.allocate_task(agent.sensors, mission_state)
        if human_override_active():
            task = apply_human_command(task)
        agent.execute(task)"
    },
    {
      id: "chapter3",
      num: 4,
      title: "Orbital Gateway Construction",
      subtitle: "Consensus Coordination for In-Orbit Assembly",
      theme: "Robotic in-orbit construction sequencing, structural tolerancing, and computational assembly logic",
      summary: "Designed the computational coordination logic for robotic in-orbit assembly sequences at the Lunar Gateway. Developed custom simulation environments to validate structural tolerances, robotic handoff sequences, and construction staging under microgravity constraints.",
      bullets: [
        "Programmed consensus-coordination algorithms for multi-robot assembly sequences in zero-gravity simulation environments.",
        "Optimised structural module interfaces against dynamic launch loads and microgravity deformation using evolutionary solvers.",
        "Developed automated clash-detection and tolerance verification workflows for orbital structural model alignment.",
        "Built custom data pipelines exporting live fabrication tolerances and assembly states to digital twin dashboards."
      ],
      tags: ["In-Orbit Assembly", "Robotic Construction Sequencing", "Microgravity Simulation", "Structural Tolerancing", "Digital Twin"],
      codeLabel: "ASSEMBLY / ORBITAL_SEQ.PY",
      subfigLabel: "ORBITAL ASSEMBLY SEQUENCE · MODULE HANDOFF LOGIC",
      code: "def orbital_assembly(modules, robot_fleet):
    sequence = plan_assembly_order(modules)
    for module in sequence:
        robot = assign_robot(robot_fleet, module)
        robot.dock(module, tolerance=0.002)  # 2mm
        verify_structural_lock(module)
        update_digital_twin(module.state)"
    },
    {
      id: "chapter2",
      num: 5,
      title: "Computational Design & Resilience",
      subtitle: "Storm Resilient Buildings · Mantis App",
      theme: "Climate hazard auditing, procedural resilience, and parametric structural design",
      summary: "Created Mantis, a Streamlit-based climate-resilience auditing and parametric design application. Mantis combines global geospatial risk data (wildfire, flood, hurricane, seismic, solar radiation) with local material availability to generate optimized, hazard-resistant structural configurations.",
      bullets: [
        "Programmed Mantis: a Python and Streamlit application for procedural hazard mapping, real-time structural resilience calculations, and SDG 11 compliance auditing.",
        "Integrated dynamic climate risk feeds (mapping wildfire, flood, hurricane, seismic, and solar radiation statistics) to calculate localized vulnerability indices.",
        "Developed parametric optimization algorithms that adapt building dimensions (length, width, height) to local environmental constraints and resource availability.",
        "Generated hazard-specific modular design packages (such as low-profile hip roofs for high wind areas, reinforced cores for tornados, and intumescent-treated timber defensible spaces for fire zones) targeting SDG 11 compliance."
      ],
      tags: ["Mantis App", "Python / Streamlit", "Procedural Resilience", "Climate Risk Profiling", "Parametric Optimization"],
      codeLabel: "MANTIS / MANTIS_ENGINE.PY",
      subfigLabel: "ENVIRONMENTAL HAZARD OPTIMIZATION STUDY MESH",
      code: "def evaluate_resilience(lat, lon, dimensions):\n    risk = mantis_db.fetch_hazards(lat, lon)\n    if risk.wildfire > 0.60:\n        design.apply_module(\"wildfire_shield\", thermal_barrier=\"4h\")\n    if risk.hurricane > 0.40:\n        design.apply_module(\"aero_canopy\", pitch=20.0)\n    return design.calculate_resilience_score(dimensions)"
    },
    {
      id: "chapter7",
      num: 6,
      title: "Selected Practice",
      subtitle: "Foster+Partners · WSP · Large-Scale Delivery",
      theme: "International practice, large-scale architectural delivery, and cross-disciplinary collaboration",
      summary: "Broad practice experience across leading international architecture and engineering firms, contributing to large-scale built projects from concept through construction delivery. Roles at Foster+Partners and WSP involved advanced computational workflows, digital fabrication, and multi-disciplinary team coordination.",
      bullets: [
        "Contributed to concept and technical design at Foster+Partners across civic, cultural, and transport typologies.",
        "Developed parametric design and structural optimization workflows for large-scale façade and structural packages at WSP.",
        "Managed cross-disciplinary BIM coordination between architectural, structural, and MEP consultants.",
        "Produced construction documentation, specification packages, and fabrication-ready digital models."
      ],
      tags: ["Foster+Partners", "WSP", "Architectural Practice", "BIM Delivery", "Large-Scale Projects"],
      codeLabel: "PRACTICE / DELIVERY_WORKFLOW.PY",
      subfigLabel: "PRACTICE TIMELINE · INTERNATIONAL DELIVERY",
      code: "def delivery_workflow(project, stage):
    team = assemble_team(project.disciplines)
    model = coordinate_bim(team, project.packages)
    if stage == 'construction':
        issue_drawings(model, project.contractor)
    return project.status"
    }
  ],

  experience: [
    {
      role: "Mobility Hubs & Urban Masterplanning Manager",
      company: "NEOM",
      location: "Saudi Arabia",
      period: "Sep 2022 – Sep 2025",
      description: "Designed architectural and digital systems for zero-carbon automated mobility networks and transit-oriented developments.",
      bullets: [
        "Embedded digital infrastructure and sensors into the public realm for passenger flow optimization and autonomous vehicle routing.",
        "Directed human-flow logic and interface legibility inside complex multi-level automated interchange hubs.",
        "Led interdisciplinary teams across structural engineering, robotics, and software development."
      ]
    },
    {
      role: "Transit Architecture Lead",
      company: "WSP",
      location: "Tel Aviv, Israel",
      period: "Apr 2016 – Aug 2022",
      description: "Architectural lead for the $5B Tel Aviv Red Line LRT, a 23km driverless underground transit system.",
      bullets: [
        "Designed driverless stations and public spaces where machine systems and robots operate autonomously alongside thousands of citizens.",
        "Oversaw automated safety gates, platform screen doors, and machine-to-human interface systems.",
        "Coordinated six years of full project lifecycle across municipal, structural, and regulatory bodies."
      ]
    },
    {
      role: "Architect · 3D Clash Detection & Roadway Design",
      company: "WSP / Middle East",
      location: "Doha, Qatar",
      period: "Jan 2015 – Jan 2016",
      description: "Developed 3D underground utility simulations and spatial clash coordination systems for Qatar's Expressway programme.",
      bullets: [
        "Used Navisworks and AutoCAD Civil 3D for spatial coordination, eliminating design collisions before physical execution."
      ]
    },
    {
      role: "Architect & 3D Designer",
      company: "Foster + Partners / MJL",
      location: "London, UK",
      period: "Jan 2014 – Jan 2015",
      description: "BIM coordinator on Bloomberg's $50M European HQ designed by Foster + Partners.",
      bullets: [
        "Maintained integrated 3D coordination models, resolving spatial interferences across complex architectural structures."
      ]
    }
  ],
  
  education: [
    {
      degree: "MSc Space Engineering & Applications (Ongoing)",
      school: "International Space University",
      location: "Strasbourg, France",
      period: "2025 – 2026",
      focus: "Swarm robotics, digital twin simulation (UE5/AirSim), and human performance analog studies (AATC Poland)."
    },
    {
      degree: "Master of Architecture & Urban Studies",
      school: "University of Novi Sad, Faculty of Technical Sciences",
      location: "Novi Sad, Serbia",
      period: "Prior",
      focus: "Computational geometry, architectural theory, and urban systems."
    },
    {
      degree: "Executive Education: The Walkable City",
      school: "Harvard Graduate School of Design",
      location: "Cambridge, USA",
      period: "2024",
      focus: "Urban design, walkable networks, and micro-mobility integration."
    },
    {
      degree: "Emerging Design & Technology: Beyond Smart Cities",
      school: "MIT",
      location: "Cambridge, USA",
      period: "2023",
      focus: "Sensor networks, responsive materials, and computational design at urban scales."
    },
    {
      degree: "Professional Specialization: System Architecture",
      school: "MIT",
      location: "Online / Professional Education",
      period: "2017",
      focus: "Model-Based Systems Engineering, dynamic system modeling, and lifecycle design."
    }
  ],
  
  affiliations: [
    "EuroMoonMars / ESA",
    "International Space University",
    "AATC Poland 2026 (Analog Astronaut / Human Performance Lead)",
    "ExoSpaceHab Express",
    "Tohoku University Space Robotics Laboratory (Collaboration)"
  ]
};
