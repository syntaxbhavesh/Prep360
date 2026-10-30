import type { Subject, Chapter, Topic } from '../types'
type ProfileInput = { examTrack: string; classLevel: string; stream: string }
const sets: Record<string,string[]> = {
  Physics:['Units and Measurements','Motion in a Straight Line','Motion in a Plane','Laws of Motion','Work, Energy and Power','System of Particles and Rotational Motion','Gravitation','Mechanical Properties of Solids','Mechanical Properties of Fluids','Thermal Properties of Matter','Thermodynamics','Kinetic Theory','Oscillations','Waves'],
  Chemistry:['Some Basic Concepts of Chemistry','Structure of Atom','Classification of Elements and Periodicity in Properties','Chemical Bonding and Molecular Structure','Chemical Thermodynamics','Equilibrium','Redox Reactions','Organic Chemistry: Some Basic Principles and Techniques','Hydrocarbons'],
  Mathematics:['Sets','Relations and Functions','Trigonometric Functions','Complex Numbers and Quadratic Equations','Linear Inequalities','Permutations and Combinations','Binomial Theorem','Sequences and Series','Straight Lines','Conic Sections','Introduction to Three Dimensional Geometry','Limits and Derivatives','Statistics','Probability'],
  Biology:['The Living World','Biological Classification','Plant Kingdom','Animal Kingdom','Morphology of Flowering Plants','Anatomy of Flowering Plants','Structural Organisation in Animals','Cell: The Unit of Life','Biomolecules','Cell Cycle and Cell Division','Photosynthesis in Higher Plants','Respiration in Plants','Plant Growth and Development','Breathing and Exchange of Gases','Body Fluids and Circulation','Excretory Products and their Elimination','Locomotion and Movement','Neural Control and Coordination','Chemical Coordination and Integration'],
  English:['Reading Comprehension','Writing Skills','Grammar and Usage','Literature'],
  'Social Science':['History','Geography','Political Science','Economics'],
  Science:['Matter in Our Surroundings','Is Matter Around Us Pure','Atoms and Molecules','Structure of the Atom','The Fundamental Unit of Life','Tissues','Motion','Force and Laws of Motion','Gravitation','Work and Energy','Sound','Why Do We Fall Ill','Natural Resources','Improvement in Food Resources'],
  'Math 9':['Number Systems','Polynomials','Coordinate Geometry','Linear Equations in Two Variables','Euclid’s Geometry','Lines and Angles','Triangles','Quadrilaterals','Circles','Heron’s Formula','Surface Areas and Volumes','Statistics','Probability'],
  'Math 10':['Real Numbers','Polynomials','Pair of Linear Equations in Two Variables','Quadratic Equations','Arithmetic Progressions','Triangles','Coordinate Geometry','Introduction to Trigonometry','Applications of Trigonometry','Circles','Areas Related to Circles','Surface Areas and Volumes','Statistics','Probability'],
  Accountancy:['Introduction to Accounting','Theory Base of Accounting','Recording of Transactions','Bank Reconciliation Statement','Trial Balance and Rectification of Errors','Depreciation, Provisions and Reserves','Bills of Exchange','Financial Statements'],
  'Business Studies':['Nature and Purpose of Business','Forms of Business Organisation','Private, Public and Global Enterprises','Business Services','Emerging Modes of Business','Social Responsibilities of Business','Formation of a Company','Sources of Business Finance','Small Business','Internal Trade','International Business'],
  Economics:['Introduction to Economics','Collection and Organisation of Data','Presentation of Data','Measures of Central Tendency','Measures of Dispersion','Correlation','Index Numbers','Introduction to Microeconomics','Consumer’s Equilibrium','Demand','Producer Behaviour and Supply','Forms of Market'],
  History:['Writing and City Life','An Empire Across Three Continents','Nomadic Empires','The Three Orders','Changing Cultural Traditions','Displacing Indigenous Peoples','Paths to Modernisation'],
  'Political Science':['Constitution: Why and How?','Rights in the Indian Constitution','Election and Representation','Executive','Legislature','Judiciary','Federalism','Local Governments','Constitution as a Living Document','The Philosophy of the Constitution'],
  Geography:['Geography as a Discipline','The Origin and Evolution of the Earth','Interior of the Earth','Distribution of Oceans and Continents','Minerals and Rocks','Geomorphic Processes','Landforms and their Evolution','Composition and Structure of Atmosphere','Solar Radiation and Heat Balance','Atmospheric Circulation and Weather Systems','Water in the Atmosphere','World Climate and Climate Change'],
  'Computer Science':['Computer System','Encoding Schemes and Number System','Boolean Logic','Problem Solving','Python Basics','Flow of Control','Functions','Strings','Lists','Tuples and Dictionaries'],
  Reasoning:['Analogy','Classification','Series','Coding-Decoding','Direction Sense','Blood Relations','Order and Ranking','Venn Diagrams','Syllogisms','Non-Verbal Reasoning'],
  'General Awareness':['Indian History','Indian Geography','Indian Polity','Indian Economy','General Science','Environment','Current Affairs']
}
const colors=['#7867f7','#20a889','#e7a54b','#e47791','#4b91d3','#8b70bd']
function makeSubject(name:string,index:number,key:string):Subject {
 const chapters:Chapter[]=(sets[key]??[]).map((chapter,i)=>({id:key+'-ch-'+i,name:chapter,topics:[{id:key+'-topic-'+i,name:chapter,lectureStatus:'Not started',dppStatus:'Not started',moduleStatus:'Not started',revisionStatus:'Not started'} as Topic]}))
 return {id:key+'-subject',name,color:colors[index%colors.length],total:chapters.length,completed:0,chapters}
}
export function buildCurriculum(p:ProfileInput):Subject[] {
 if(p.classLevel==='9') return [makeSubject('Mathematics',0,'Math 9'),makeSubject('Science',1,'Science'),makeSubject('Social Science',2,'Social Science'),makeSubject('English',3,'English')]
 if(p.classLevel==='10') return [makeSubject('Mathematics',0,'Math 10'),makeSubject('Science',1,'Science'),makeSubject('Social Science',2,'Social Science'),makeSubject('English',3,'English')]
 let result:Subject[]
 if(p.stream==='Science') result=[makeSubject('Physics',0,'Physics'),makeSubject('Chemistry',1,'Chemistry'),makeSubject('Mathematics',2,'Mathematics'),makeSubject('English',3,'English'),makeSubject('Computer Science',4,'Computer Science')]
 else if(p.stream==='Commerce') result=[makeSubject('Accountancy',0,'Accountancy'),makeSubject('Business Studies',1,'Business Studies'),makeSubject('Economics',2,'Economics'),makeSubject('Mathematics',3,'Mathematics'),makeSubject('English',4,'English'),makeSubject('Computer Science',5,'Computer Science')]
 else result=[makeSubject('History',0,'History'),makeSubject('Political Science',1,'Political Science'),makeSubject('Geography',2,'Geography'),makeSubject('Economics',3,'Economics'),makeSubject('English',4,'English'),makeSubject('Computer Science',5,'Computer Science')]
 if(p.examTrack==='NEET'&&p.stream==='Science') result=result.filter(s=>s.name!=='Mathematics').concat(makeSubject('Biology',5,'Biology'))
 if(p.examTrack==='Defence'){result.push(makeSubject('Reasoning',result.length,'Reasoning'),makeSubject('General Awareness',result.length+1,'General Awareness'))}
 return result
}
export function mergeCurriculum(existing:Subject[],fresh:Subject[]):Subject[]{
 return fresh.map((next,index)=>{const old=existing.find(s=>s.name.trim().toLowerCase()===next.name.trim().toLowerCase());if(!old)return {...next,color:colors[index%colors.length]};const oldCh=old.chapters??[];const merged=(next.chapters??[]).map(ch=>{const prior=oldCh.find(c=>c.name.trim().toLowerCase()===ch.name.trim().toLowerCase());return prior?{...ch,id:prior.id,topics:prior.topics}:ch});for(const prior of oldCh)if(!merged.some(ch=>ch.name.trim().toLowerCase()===prior.name.trim().toLowerCase()))merged.push(prior);return {...old,chapters:merged,total:merged.length,completed:merged.filter(ch=>ch.topics.length>0&&ch.topics.every(t=>t.lectureStatus==='Completed')).length}})
}
