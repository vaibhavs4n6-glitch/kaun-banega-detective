// Kaun Banega Detective — question bank (15 questions)
// Source: "Forensimia quiz.docx"
// Each entry: { id, title, tag, brief[], prompt, image, options[4], answer (0-3), reasoning }

const QUESTIONS = [
  {
    id: 1,
    title: 'The Kitchen Mystery',
    tag: 'Presumptive Blood Testing',
    brief: [
      'A detective suspects that a knife may have been washed after being used in a stabbing. Luminol is sprayed on the clean steel blade in a dark room.',
      'The entire blade produces an extremely bright blue glow for a few seconds and then fades rapidly.'
    ],
    prompt: 'What is the most scientifically sound deduction?',
    options: [
      'The intense glow conclusively proves that human blood was present on the blade.',
      'Bleach and certain plant enzymes can produce strong false-positive reactions with Luminol.',
      'Luminol only reacts with blood that has been dried for at least seven days.',
      'The knife must have been heated to a high temperature before testing.'
    ],
    answer: 1,
    reasoning: 'Luminol reacts with substances other than blood. Strong oxidising agents such as bleach, along with certain plant peroxidases, generate an intense chemiluminescent response. A bright glow alone therefore carries no confirmatory value for human blood and demands a confirmatory test.'
  },
  {
    id: 2,
    title: 'The Two Gunshots',
    tag: 'Glass Fracture Sequencing',
    brief: [
      'Two bullet holes, A and B, are found in a glass window.',
      'During examination, the investigator observes that the radial cracks coming from Hole B stop when they reach the cracks coming from Hole A.'
    ],
    prompt: 'Which bullet was fired first?',
    options: [
      'Bullet B',
      'Bullet A',
      'Both bullets were fired simultaneously',
      'The sequence cannot be determined from the cracks'
    ],
    answer: 1,
    reasoning: 'Radial fractures propagate outward from the point of impact and terminate on encountering a pre-existing fracture. The cracks from B terminate at the cracks from A, establishing that the fracture system of A was already present. Impact A therefore preceded impact B.'
  },
  {
    id: 3,
    title: 'The Untouched Glass',
    tag: 'Latent Print Development',
    brief: [
      'A forensic team wants to develop a latent fingerprint immediately at a crime scene using standard black fingerprint powder and lifting tape.',
      'Four substrates are available at the scene: a sheet of paper, an unfinished wooden desk, a smooth glass surface and a piece of untreated fabric.'
    ],
    prompt: 'Which surface is most likely to produce the best immediate result using standard fingerprint powder?',
    options: ['Paper', 'Unfinished wood', 'Smooth glass', 'Untreated fabric'],
    answer: 2,
    reasoning: 'Powder development depends on adhesion of particles to residue retained at the surface. On smooth non-porous substrates the eccrine and sebaceous residue remains superficial, whereas porous substrates absorb it into the matrix and require chemical development such as ninhydrin or DFO. Glass is therefore the substrate of choice for immediate powder processing.'
  },
  {
    id: 4,
    title: 'The Shed Hair',
    tag: 'Forensic DNA Typing',
    brief: [
      'A single hair is recovered from a victim’s clothing.',
      'Microscopic examination shows that the hair was naturally shed and has no root tissue attached.'
    ],
    prompt: 'Which type of DNA analysis can most reliably provide useful genetic information from this hair?',
    options: [
      'Standard nuclear DNA STR profiling',
      'Mitochondrial DNA (mtDNA) analysis',
      'Complete paternal chromosome profiling',
      'No DNA analysis is possible from hair'
    ],
    answer: 1,
    reasoning: 'A telogen hair shaft lacks the follicular tissue that supplies nuclear template for conventional STR amplification. Mitochondrial DNA persists in the shaft at high copy number and yields maternal lineage information, although its discriminating power remains lower than a full autosomal STR profile.'
  },
  {
    id: 5,
    title: 'The Vehicle Skid',
    tag: 'Accident Reconstruction',
    brief: [
      'Investigators find long, dark skid marks on a dry asphalt road leading toward the point of a collision.'
    ],
    prompt: 'What primarily causes these dark marks during heavy braking?',
    options: [
      'Tire rubber is heated and deposited onto the road as the tire slides.',
      'Engine oil is released when the brake pedal is pressed.',
      'Brake pads spray carbon particles onto the road surface.',
      'Skid marks form only when the road surface is wet.'
    ],
    answer: 0,
    reasoning: 'In a locked-wheel skid the tyre slides rather than rolls. Frictional heating at the contact patch softens the tread compound, which abrades and transfers onto the pavement. The resulting deposit records the skid length used in speed estimation during reconstruction.'
  },
  {
    id: 6,
    title: 'The Cold Morning Murder',
    tag: 'Post-mortem Interval',
    brief: [
      'A victim is found dead inside a heated mountain cabin maintained at a constant 24°C throughout the night. The police initially believe the victim was murdered at around 8:00 AM, roughly one hour before discovery.',
      'The Roommate: “I entered the cabin at 8:00 AM. I found him dead and immediately called the police.”',
      'The Neighbor: “I was outside the cabin at around 8:00 AM. I heard the victim shouting from inside.”',
      'The Business Partner: “I was driving toward the cabin between 7:30 AM and 8:30 AM.”',
      'The Landlord: “I haven’t visited the property all week.”',
      'The medical examiner records fully developed rigor mortis, with severe stiffness in the arms, legs and jaw.'
    ],
    prompt: 'Which suspect’s statement is most strongly contradicted by the forensic evidence?',
    options: ['The Roommate', 'The Neighbor', 'The Business Partner', 'The Landlord'],
    answer: 1,
    reasoning: 'Complete rigor mortis at an ambient temperature of 24°C requires several hours of post-mortem interval. Full rigidity is therefore incompatible with death at 8:00 AM and places the time of death considerably earlier. The Neighbor’s account of hearing the victim shouting at 8:00 AM is the statement irreconcilable with that finding.'
  },
  {
    id: 7,
    title: 'The Broken Glass Sequence',
    tag: 'Fracture Matching',
    brief: [
      'A jewellery store is robbed during the night and the display case containing several diamonds has been shattered. Two distinct bullet holes, labelled A and B, are identified in the glass.',
      'Suspect Alpha: “I fired Shot B from outside the store window first.”',
      'Suspect Beta: “I fired Shot A first to break the alarm sensor.”',
      'Suspect Gamma: “Both shots were fired at exactly the same time from inside the store.”',
      'Suspect Delta: “No bullet actually hit the glass. It shattered when the display was struck.”',
      'The fracture examination shows that cracks originating from Hole B stop abruptly wherever they meet cracks originating from Hole A.'
    ],
    prompt: 'Whose statement is supported by the fracture evidence?',
    options: ['Suspect Alpha', 'Suspect Beta', 'Suspect Gamma', 'Suspect Delta'],
    answer: 1,
    reasoning: 'A propagating fracture cannot cross an existing discontinuity in the glass. Termination of the B fractures against the A fractures establishes that the A system formed first, placing Shot A before Shot B and corroborating the account given by Beta.'
  },
  {
    id: 8,
    title: 'The Shed Hair Mystery',
    tag: 'Trace Evidence Interpretation',
    brief: [
      'A body is discovered in an abandoned building after a suspected assault. A single long hair is recovered from the victim’s collar and appears naturally shed with no root or follicular tissue attached.',
      'Suspect 1: “If it’s my hair, a standard nuclear DNA test will identify me with certainty.”',
      'Suspect 2: “Even without the root, the hair may still contain mitochondrial DNA that can provide information about the maternal line.”',
      'Suspect 3: “A hair without a root contains absolutely no biological material.”',
      'Suspect 4: “A hair without a root must have come from a synthetic wig.”'
    ],
    prompt: 'Which statement is scientifically accurate?',
    options: ['Suspect 1', 'Suspect 2', 'Suspect 3', 'Suspect 4'],
    answer: 1,
    reasoning: 'A naturally shed shaft lacks the nuclear-DNA-rich root required for conventional STR profiling, so the claim of certain nuclear identification fails. Mitochondrial DNA remains recoverable from the shaft and reports maternal lineage. The assertion that a rootless hair holds no usable biological material is incorrect.'
  },
  {
    id: 9,
    title: 'The Twin Alibi',
    tag: 'Dactyloscopy',
    brief: [
      'A luxury car is reported stolen and later recovered with a clear fingerprint on the steering wheel. The print matches Suspect 1, who admits that his identical twin brother was also in the area that day.',
      'Suspect 1: “You can’t prove it was me. My twin and I have identical DNA, so our fingerprints are identical too. That fingerprint could belong to either of us.”',
      'The forensic examiner confirms that the recovered print contains several clearly visible ridge characteristics.'
    ],
    prompt: 'Why is the suspect’s scientific defense invalid?',
    options: [
      'Identical twins always have different blood groups.',
      'Identical twins have genetically identical fingerprints.',
      'Fingerprint ridge details develop through complex developmental processes and remain distinct even between identical twins.',
      'Fingerprints are determined entirely by a person’s DNA.'
    ],
    answer: 2,
    reasoning: 'Monozygotic twins share a genome but not a friction ridge arrangement. Minutiae form during foetal development under the combined influence of genetic patterning and stochastic mechanical conditions in the volar pads, producing unique ridge detail in every individual. Fingerprint comparison therefore discriminates between identical twins.'
  },
  {
    id: 10,
    title: 'The Inverted Fire Clue',
    tag: 'Fire Scene Investigation',
    brief: [
      'A jewellery store catches fire during the night and much of the interior is damaged before firefighters arrive.',
      'Store Owner: “I think a light bulb near the ceiling exploded and started the fire.”',
      'Night Guard: “Just before the alarm went off, I noticed a strong smell of gasoline near the front floor display.”',
      'Electrician: “The circuit breaker tripped at around 9:00 PM.”',
      'Passerby: “I saw smoke coming from the roof shortly after the fire started.”',
      'Examination reveals an inverted cone-shaped burn pattern on one wall, with deep concentrated charring of the floorboards directly beneath it.'
    ],
    prompt: 'Which suspect’s statement is most strongly supported by the fire pattern?',
    options: ['The Store Owner', 'The Night Guard', 'The Electrician', 'The Passerby'],
    answer: 1,
    reasoning: 'An inverted cone rising from severe floor-level charring is consistent with a pool of ignitable liquid burning at the base of the wall rather than with a ceiling-level ignition source. The pattern supports accelerant involvement at floor level and corroborates the Night Guard’s observation of a gasoline odour, pending confirmation by debris analysis.'
  },
  {
    id: 11,
    title: 'The Blood-Stained Sleeve',
    tag: 'Scene Interpretation',
    brief: [
      'Examine the scene photograph. Two individuals are present: one standing in a white shirt, one lying on the floor in a red shirt.'
    ],
    image: 'img/q11.jpg',
    prompt: 'Who is the victim?',
    options: [
      'Person in the White Shirt',
      'Person in the Red Shirt',
      'Both',
      'Cannot be determined'
    ],
    answer: 1,
    reasoning: 'The individual in the red shirt lies motionless within a pool of blood, which identifies the victim. The individual in the white shirt stands immediately beside the body with blood staining on the sleeve, which is the strongest visible indication of involvement in the attack and identifies the assailant.'
  },
  {
    id: 12,
    title: 'What Really Happened?',
    tag: 'Manner of Death',
    brief: [
      'Examine the scene. A person is found on the floor of a residence. A handwritten note reading “I’m sorry” lies on the desk.'
    ],
    image: 'img/q12.jpg',
    prompt: 'This scene is most consistent with:',
    options: ['Murder', 'Suicide', 'Accidental death', 'Cannot be determined from the scene'],
    answer: 0,
    reasoning: 'Overturned furniture, projected bloodstaining on the wall and the position of the body away from the apparent source of disturbance are inconsistent with an uncomplicated accidental death. A written note carries no probative weight on manner of death and can be placed to misdirect an investigation. The combination of disturbance, blood distribution and the placement of the note supports homicide.'
  },
  {
    id: 13,
    title: 'The Hanging Room',
    tag: 'Manner of Death',
    brief: [
      'A person is found hanging from the ceiling fan inside a bedroom. A chair and a stool are overturned, a notebook lies open on the floor and a note reading “I QUIT” is attached to the door.',
      'There are no visible signs of forced entry, and no other person is present in the room.'
    ],
    image: 'img/q13.jpg',
    prompt: 'Based only on the visible evidence, what is the most likely manner of death?',
    options: ['Murder', 'Suicide', 'Accidental death', 'Cannot be determined'],
    answer: 1,
    reasoning: 'The suspension, the apparent preparation of the scene, the note on the door and the absence of forced entry or a second person collectively indicate self-inflicted death. The overturned furniture is consistent with the act itself and does not by itself establish a struggle. Confirmation requires autopsy findings on the ligature mark and full scene reconstruction.'
  },
  {
    id: 14,
    title: 'The Staged Burglary',
    tag: 'Scene Reconstruction',
    brief: [
      'A businessman reports that his house was robbed during the night, stating that he was asleep upstairs when the thief entered through the kitchen window. The window is broken and several valuables are missing.',
      'The broken glass from the window is found mostly outside the house.',
      'Muddy footprints lead from the window toward the living room and stop suddenly near the carpet.',
      'The businessman is wearing clean socks; his shoes are found inside the house, completely dry.',
      'He insists he never left his bedroom during the night.'
    ],
    prompt: 'Which conclusion is most strongly supported by the combined evidence?',
    options: [
      'An unknown thief definitely entered through the kitchen window.',
      'The businessman may have staged the break-in to make it appear that someone entered from outside.',
      'The thief entered through the front door and escaped through the window.',
      'The muddy footprints prove that the businessman was asleep upstairs.'
    ],
    answer: 1,
    reasoning: 'Glass deposited predominantly on the exterior indicates fracture directed from inside outward, which contradicts the claimed outside-to-inside entry. Footprints beginning at the window and terminating abruptly, together with dry footwear inside the residence, weaken the external-intruder account further. The evidence supports staging of the scene without establishing the reporter as the offender, which is why the conclusion is framed as a possibility.'
  },
  {
    id: 15,
    title: 'The Final Evidence',
    tag: 'Toxicology and Inference',
    brief: [
      'A woman is found dead in her locked apartment. A handwritten note on the table reads “I can’t live with this anymore” and a glass of clear liquid stands beside it. The handwriting appears to be hers.',
      'Her fingerprints are present on the outside of the glass and on the pen used to write the note.',
      'Toxicology detects a lethal substance in her body; the substance is not detected in the glass.',
      'The apartment door was locked from the inside and there are no obvious signs of forced entry.'
    ],
    prompt: 'Which conclusion is the most scientifically justified?',
    options: [
      'It was definitely suicide because the note and fingerprints belong to the victim.',
      'It was definitely murder because the poison was not found in the glass.',
      'Suicide remains possible, but the evidence is insufficient to determine the manner of death without further investigation.',
      'The fingerprints prove that the victim personally prepared and consumed the poison.'
    ],
    answer: 2,
    reasoning: 'Fingerprints establish contact, not the time of contact or voluntary ingestion. Absence of the toxicant in the glass excludes that vessel as the vehicle without excluding another route or location of administration. A locked door and a note do not establish self-infliction. The defensible position is that suicide remains possible while the manner of death stays undetermined pending further toxicology, autopsy findings, handwriting examination, digital evidence and scene reconstruction.'
  }
];

module.exports = { QUESTIONS };
