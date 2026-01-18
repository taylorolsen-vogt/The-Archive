export const timelineData = {
      level: 'eons',
      path: ['Earth'],
      items: [
        {
          id: 'hadean',
          type: 'eon',
          name: 'Hadean',
          value: 5,  // Spread out more (was 2)
          yearStart: -4600000000,
          yearEnd: -4000000000,
          description: "Earth forms from cosmic dust. Molten surface, no solid crust. Constant bombardment from asteroids and comets.",
          children: [], // Will add eras later
          events: [
            { name: "Earth Formation", location: "Global", lat: 0, lon: 0 },
            { name: "Moon Formation (Giant Impact)", location: "Global", lat: 0, lon: 0 }
          ]
        },
        {
          id: 'archean',
          type: 'eon',
          name: 'Archean',
          value: 15,  // Better spacing (was 5)
          yearStart: -4000000000,
          yearEnd: -2500000000,
          description: "First solid crust forms. Primitive single-celled life emerges in deep ocean vents. Atmosphere lacks oxygen.",
          children: [],
          events: [
            { name: "First Life (Bacteria)", location: "Deep Ocean Vents", lat: -20, lon: -30 },
            { name: "Earliest Known Rocks", location: "Greenland", lat: 72, lon: -42 }
          ]
        },
        {
          id: 'proterozoic',
          type: 'eon',
          name: 'Proterozoic',
          value: 35,  // Better spacing (was 9)
          yearStart: -2500000000,
          yearEnd: -541000000,
          description: "Oxygen atmosphere develops from cyanobacteria. First complex cells with nuclei. Snowball Earth episodes.",
          children: [],
          events: [
            { name: "Great Oxidation Event", location: "Global", lat: 0, lon: 0 },
            { name: "First Multicellular Life", location: "Ancient Oceans", lat: -10, lon: 80 }
          ]
        },
        {
          id: 'phanerozoic',
          type: 'eon',
          name: 'Phanerozoic',
          value: 65,  // Better spacing (was 15)
          yearStart: -541000000,
          yearEnd: 2026,
          description: "The age of visible life. From Cambrian explosion to present day. Continents shift, species rise and fall.",
          children: [
            {
              id: 'paleozoic',
              type: 'era',
              name: 'Paleozoic',
              value: 15,
              yearStart: -541000000,
              yearEnd: -252000000,
              description: "Cambrian explosion - life diversifies rapidly. First fish, plants colonize land, first forests and insects.",
              children: [
                {
                  id: 'cambrian',
                  type: 'period',
                  name: 'Cambrian',
                  value: 10,
                  yearStart: -541000000,
                  yearEnd: -485000000,
                  description: "Explosion of life. Most major animal groups appear. Trilobites dominate the seas.",
                  children: [],
                  events: [
                    { name: "Cambrian Explosion", location: "Global Oceans", lat: 0, lon: 0 }
                  ]
                },
                {
                  id: 'ordovician',
                  type: 'period',
                  name: 'Ordovician',
                  value: 12,
                  yearStart: -485000000,
                  yearEnd: -444000000,
                  description: "Marine life flourishes. First land plants appear. Ends with mass extinction.",
                  children: [],
                  events: []
                },
                {
                  id: 'silurian',
                  type: 'period',
                  name: 'Silurian',
                  value: 14,
                  yearStart: -444000000,
                  yearEnd: -419000000,
                  description: "Life recovers. First jawed fish. Plants begin to colonize land.",
                  children: [],
                  events: []
                },
                {
                  id: 'devonian',
                  type: 'period',
                  name: 'Devonian',
                  value: 16,
                  yearStart: -419000000,
                  yearEnd: -359000000,
                  description: "Age of Fishes. First forests. First tetrapods walk on land.",
                  children: [],
                  events: [
                    { name: "First Forests", location: "Equatorial Regions", lat: 0, lon: 30 }
                  ]
                },
                {
                  id: 'carboniferous',
                  type: 'period',
                  name: 'Carboniferous',
                  value: 18,
                  yearStart: -359000000,
                  yearEnd: -299000000,
                  description: "Vast swamp forests. Giant insects. First reptiles. Coal deposits form.",
                  children: [],
                  events: []
                },
                {
                  id: 'permian',
                  type: 'period',
                  name: 'Permian',
                  value: 20,
                  yearStart: -299000000,
                  yearEnd: -252000000,
                  description: "Pangaea forms. Reptiles diversify. Ends with worst mass extinction ever.",
                  children: [],
                  events: []
                }
              ],
              events: [
                { name: "Cambrian Explosion", location: "Shallow Seas", lat: 20, lon: 110 },
                { name: "First Land Plants", location: "Ancient Coastlines", lat: 35, lon: -10 },
                { name: "First Forests", location: "Equatorial Regions", lat: 0, lon: 30 }
              ]
            },
            {
              id: 'mesozoic',
              type: 'era',
              name: 'Mesozoic',
              value: 35,
              yearStart: -252000000,
              yearEnd: -66000000,
              description: "Age of Dinosaurs. Pangaea supercontinent breaks apart. First mammals and birds appear. Ends with asteroid impact.",
              children: [
                {
                  id: 'triassic',
                  type: 'period',
                  name: 'Triassic',
                  value: 30,
                  yearStart: -252000000,
                  yearEnd: -201000000,
                  description: "Recovery after Permian extinction. First dinosaurs and mammals. Pangaea still intact.",
                  children: [],
                  events: [
                    { name: "First Dinosaurs", location: "Pangaea", lat: -20, lon: 20 }
                  ]
                },
                {
                  id: 'jurassic',
                  type: 'period',
                  name: 'Jurassic',
                  value: 33,
                  yearStart: -201000000,
                  yearEnd: -145000000,
                  description: "Dinosaurs dominate. First birds evolve. Pangaea begins to split apart.",
                  children: [],
                  events: [
                    { name: "First Birds", location: "Northern Pangaea", lat: 40, lon: 100 }
                  ]
                },
                {
                  id: 'cretaceous',
                  type: 'period',
                  name: 'Cretaceous',
                  value: 36,
                  yearStart: -145000000,
                  yearEnd: -66000000,
                  description: "Peak of dinosaurs. Flowering plants appear. Ends with asteroid impact and mass extinction.",
                  children: [],
                  events: [
                    { name: "Asteroid Impact", location: "Chicxulub, Mexico", lat: 21.3, lon: -89.5 }
                  ]
                }
              ],
              events: [
                { name: "Dinosaurs Dominate", location: "Pangaea", lat: 10, lon: 0 },
                { name: "First Mammals", location: "Southern Pangaea", lat: -30, lon: 20 },
                { name: "Asteroid Impact", location: "Chicxulub, Mexico", lat: 21.3, lon: -89.5 }
              ]
            },
            {
              id: 'cenozoic',
              type: 'era',
              name: 'Cenozoic',
              value: 55,
              yearStart: -66000000,
              yearEnd: 2026,
              description: "Age of Mammals. Ice ages, human evolution, and the rise of civilization.",
              children: [
                {
                  id: 'paleogene',
                  type: 'period',
                  name: 'Paleogene',
                  value: 55,
                  yearStart: -66000000,
                  yearEnd: -23000000,
                  description: "Dinosaurs extinct. Mammals diversify rapidly and grow larger. Early primates appear in trees.",
                  children: [],
                  events: [
                    { name: "Mammals Diversify", location: "Global", lat: 20, lon: 0 },
                    { name: "First Primates", location: "Tropical Forests", lat: 10, lon: 100 }
                  ]
                },
                {
                  id: 'neogene',
                  type: 'period',
                  name: 'Neogene',
                  value: 75,
                  yearStart: -23000000,
                  yearEnd: -2600000,
                  description: "Modern continents take shape. Grasslands spread globally. Great apes evolve in Africa.",
                  children: [],
                  events: [
                    { name: "Grasslands Expand", location: "Africa & Americas", lat: 0, lon: 20 },
                    { name: "Great Apes Evolve", location: "East Africa", lat: 0, lon: 35 }
                  ]
                },
                {
                  id: 'quaternary',
                  type: 'period',
                  name: 'Quaternary',
                  value: 85,
                  yearStart: -2600000,
                  yearEnd: 2026,
                  description: "Ice ages and human evolution. From stone tools to space exploration.",
                  children: [
                    {
                      id: 'pleistocene',
                      type: 'epoch',
                      name: 'Pleistocene',
                      value: 85,
                      yearStart: -2600000,
                      yearEnd: -12000,
                      description: "Ice ages cycle with warmer periods. Early humans evolve and spread from Africa across the world.",
                      children: [],
                      events: [
                        { name: "Homo Habilis (First Humans)", location: "East Africa", lat: -2, lon: 36 },
                        { name: "Humans Leave Africa", location: "Middle East", lat: 32, lon: 35 },
                        { name: "Neanderthals in Europe", location: "Europe", lat: 50, lon: 10 }
                      ]
                    },
                    {
                      id: 'holocene',
                      type: 'epoch',
                      name: 'Holocene',
                      value: 95,
                      yearStart: -12000,
                      yearEnd: 2026,
                      description: "Ice age ends. Agriculture, cities, writing, and civilization emerge. The modern human era.",
                      children: [],
                      events: [
                        { name: "Agriculture Begins", location: "Fertile Crescent", lat: 33, lon: 44 },
                        { name: "First Cities", location: "Mesopotamia", lat: 33, lon: 44 },
                        { name: "Writing Invented", location: "Sumer", lat: 31, lon: 46 },
                        { name: "Industrial Revolution", location: "England", lat: 53, lon: -2 }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    };
