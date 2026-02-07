export type BuildingId = string;

export type LatLng = { latitude: number; longitude: number };

export type Accessibility = {
  hasElevator: boolean;
  hasParking: boolean;
  isAccessible: boolean;
};

export type OpeningHours = {
  label: string; // e.g., "Mon–Fri 8:00–22:00"
};

export type Building = {
  id: BuildingId;               // "FB", "EV", ...
  name: string;
  marker: LatLng;
  polygon: LatLng[];
  addressLines: string[];

  openingHours: OpeningHours;
  hasStudySpots: boolean;

  // Local image reference
  // We use `any` because require(...) returns a number in RN.
  image: any;

  accessibility: Accessibility;
};

export const BUILDINGS: Building[] = [
  // **************************** SGW SECTION OF BUILDINGS ****************************
  {
    id: "FB",
    name: "Faubourg Building",
    marker: { latitude: 45.49472, longitude: -73.57772 },
    addressLines: ["1250 Guy St. (main entrance)", "Catherine St. W."],
    polygon: [
      { latitude: 45.494907593260784, longitude: -73.57778184874842 },
      { latitude: 45.49451110096495, longitude: -73.57825550609759 },
      { latitude: 45.494282230157545, longitude: -73.57787841966426 },
      { latitude: 45.494733523816116, longitude: -73.5773725720098 },
    ],

    openingHours: { label: "Mon–Fri 9:00–17:00" },
    hasStudySpots: true,

    image: require("../../assets/buildings/fb.jpg"),

    accessibility: {
      hasElevator: true,
      hasParking: true,
      isAccessible: true,
    },
  },
  {
    id: "EV",
    name: "Engineering, Computer Science and Visual Arts Integrated Complex",
    marker: { latitude: 45.49539, longitude: -73.57799 },
    addressLines: ["1515 Ste-Catherine St. W."],
    polygon: [
      { latitude: 45.49586696917776, longitude: -73.57849767209156 },
      { latitude: 45.495447845458415, longitude: -73.57761175921861 },
      { latitude: 45.4951955080872, longitude: -73.57790501481942 },
      { latitude: 45.495595554611526, longitude: -73.57876370936708 },
    ],

    openingHours: { label: "Mon–Sun 8:30–19:00" },
    hasStudySpots: true,

    image: require("../../assets/buildings/ev.jpg"),

    accessibility: {
      hasElevator: true,
      hasParking: false,
      isAccessible: true,
    },
  },
  {
    id: "LB",
    name: "Webster Library",
    marker: { latitude: 45.496798007653645, longitude: -73.57803724265663 },
    addressLines: ["1515 Ste-Catherine St. W."],
    polygon: [
      { latitude: 45.49725895125797, longitude: -73.57805793642433 },
      { latitude: 45.49669002381621, longitude: -73.57860747092167 },
      { latitude: 45.49632255487784, longitude: -73.57784180151741 },
      { latitude: 45.49689470942183, longitude: -73.57728996771255 },
    ],

    openingHours: { label: "Mon–Sun Open 24 hours" },
    hasStudySpots: true,

    image: require("../../assets/buildings/lb.jpg"),

    accessibility: {
      hasElevator: true,
      hasParking: true,
      isAccessible: true,
    },
  },
  {
    id: "H",
    name: "Henry F. Hall Building",
    marker: { latitude: 45.49733989962878, longitude: -73.57903014967104 },
    addressLines: ["1455 De Maisonneuve Blvd. W."],
    polygon: [
      { latitude: 45.49770736194637, longitude: -73.57903474828731 },
      { latitude: 45.49716583769831, longitude: -73.57953829665507 },
      { latitude: 45.49682738239871, longitude: -73.57884850437048 },
      { latitude: 45.49737535662623, longitude: -73.57834265669511 },
    ],

    openingHours: { label: "Mon–Fri 9:00-17:00" },
    hasStudySpots: true,

    image: require("../../assets/buildings/h.jpg"),

    accessibility: {
      hasElevator: true,
      hasParking: false,
      isAccessible: true,
    },
  },
  {
    id: "CL",
    name: "CL Annex",
    marker: { latitude: 45.49429413805923, longitude: -73.57920092745108 },
    addressLines: ["1665 Ste-Catherine St. W."],
    polygon: [
      { latitude: 45.494334143482156, longitude: -73.57945028252378 },
      { latitude: 45.49412857685624, longitude: -73.57909820018449 },
      { latitude: 45.49426090276436, longitude: -73.57893576818257 },
      { latitude: 45.49447139263802, longitude: -73.57928433847859 },
    ],

    openingHours: { label: "Mon–Fri 7:30-21:30" },
    hasStudySpots: true,

    image: require("../../assets/buildings/cl.jpg"),

    accessibility: {
      hasElevator: true,
      hasParking: false,
      isAccessible: true,
    },
  },
  {
    id: "MB",
    name: "John Molson School of Business",
    marker: { latitude: 45.495297980272596, longitude: -73.57900517401788 },
    addressLines: ["1450 Guy St."],
    polygon: [
      { latitude: 45.49551797243536, longitude: -73.57920067382376 },
      { latitude: 45.49535668951492, longitude: -73.5793648618648 },
      { latitude: 45.495019246570635, longitude: -73.57873156513509 },
      { latitude: 45.49520010371333, longitude: -73.57854615551052 },
    ],

    openingHours: { label: "Mon–Fri 9:00-17:00" },
    hasStudySpots: true,

    image: require("../../assets/buildings/mb.jpg"),

    accessibility: {
      hasElevator: true,
      hasParking: false,
      isAccessible: true,
    },
  },
  {
    id: "LS",
    name: "Learning Square",
    marker: { latitude: 45.49637488264317, longitude: -73.57948281092284 },
    addressLines: ["1535 De Maisonneuve Blvd. W."],
    polygon: [
      { latitude: 45.496163300109195, longitude: -73.57944485390425 },
      { latitude: 45.496378683520916, longitude: -73.5792406089995 },
      { latitude: 45.49653198532927, longitude: -73.57957318477284 },
      { latitude: 45.49642049314639, longitude: -73.57967801844052 },
      { latitude: 45.49636474697219, longitude: -73.57958222215798 },
      { latitude: 45.496268457995846, longitude: -73.57967259600943 },
    ],

    openingHours: { label: "Mon–Fri 9:00-17:00" },
    hasStudySpots: true,

    image: require("../../assets/buildings/ls.jpg"),

    accessibility: {
      hasElevator: false,
      hasParking: false,
      isAccessible: true,
    },
  },
  {
    id: "ER",
    name: "ER Building",
    marker: { latitude: 45.49638596930839, longitude: -73.58018822654073 },
    addressLines: ["2155 Guy St."],
    polygon: [
      { latitude: 45.49615283570929, longitude: -73.57998974306885 },
      { latitude: 45.49652133676172, longitude: -73.5796678779793 },
      { latitude: 45.4966755048539, longitude: -73.58011580689558 },
      { latitude: 45.49628444350483, longitude: -73.58040548547616 },
    ],

    openingHours: { label: "Mon–Fri 7:00-11:00 and Sat-Sun 9:00-21:00" },
    hasStudySpots: true,

    image: require("../../assets/buildings/er.jpg"),

    accessibility: {
      hasElevator: true,
      hasParking: false,
      isAccessible: true,
    },
  },

  // **************************** LOYOLA SECTION OF BUILDINGS ****************************
  {
    id: "VL",
    name: "Vanier Libary Building",
    marker: { latitude: 45.45896275540376, longitude: -73.63859033366037 },
    addressLines: ["7141 Sherbrooke St. W."],
    polygon: [
      { latitude: 45.458847992641245, longitude: -73.6390114404858 },
      { latitude: 45.45931080497647, longitude: -73.63866007109642 },
      { latitude: 45.459141483831075, longitude: -73.63820141334384 },
      { latitude: 45.45921297504337, longitude: -73.63812899369869 },
      { latitude: 45.459105738190935, longitude: -73.63784467953627 },
      { latitude: 45.45889690794563, longitude: -73.63800561208105 },
      { latitude: 45.45886492486679, longitude: -73.6382470108982 },
      { latitude: 45.45862034778173, longitude: -73.63843208332467 },
    ],

    openingHours: { label: "Mon–Sun Open 24 hours" },
    hasStudySpots: true,

    image: require("../../assets/buildings/vl.jpg"),

    accessibility: {
      hasElevator: true,
      hasParking: false,
      isAccessible: true,
    },
  },
  {
    id: "HU",
    name: "Applied Science Hub",
    marker: { latitude: 45.45850650474647, longitude: -73.64183117003009 },
    addressLines: ["7141 Sherbrooke St. W."],
    polygon: [
      { latitude: 45.45844817200076, longitude: -73.64211285144718 },
      { latitude: 45.45872478158214, longitude: -73.64190360239449 },
      { latitude: 45.458572364225546, longitude: -73.64150924841056 },
      { latitude: 45.458295753896465, longitude: -73.64171581478308 },
    ],

    openingHours: { label: "Restricted Access" },
    hasStudySpots: false,

    image: require("../../assets/buildings/hu.jpg"),

    accessibility: {
      hasElevator: true,
      hasParking: false,
      isAccessible: true,
    },
  },
  {
    id: "SP",
    name: "Richard J. Renaud Science Complex",
    marker: { latitude: 45.45793786292976, longitude: -73.64147742435523 },
    addressLines: ["7141 Sherbrooke St. W."],
    polygon: [
      { latitude: 45.458323188032594, longitude: -73.64140918311298 },
      { latitude: 45.45745440783411, longitude: -73.64205406285222 },
      { latitude: 45.456987702192095, longitude: -73.64083595668635 },
      { latitude: 45.457205498634984, longitude: -73.64066194151862 },
      { latitude: 45.457526208349194, longitude: -73.64146377611503 },
      { latitude: 45.45817001562751, longitude: -73.64097585123295 },
    ],

    openingHours: { label: "~8:00-22:00" },
    hasStudySpots: true,

    image: require("../../assets/buildings/sp.jpg"),

    accessibility: {
      hasElevator: true,
      hasParking: false,
      isAccessible: true,
    },
  },
  {
    id: "AD",
    name: "Administration Building",
    marker: { latitude: 45.45807527451618, longitude: -73.6398275776765 },
    addressLines: ["7141 Sherbrooke St. W."],
    polygon: [
      { latitude: 45.458376979344756, longitude: -73.63976643191464 },
      { latitude: 45.45791554777998, longitude: -73.64012276408482 },
      { latitude: 45.4577972313859, longitude: -73.63982968614602 },
      { latitude: 45.4582527481411, longitude: -73.639448052283294 },
    ],

    openingHours: { label: "Mon-Fri 10:00-16:00" },
    hasStudySpots: false,

    image: require("../../assets/buildings/ad.jpg"),

    accessibility: {
      hasElevator: true,
      hasParking: true,
      isAccessible: true,
    },
  },
  {
    id: "CC",
    name: "Central Building",
    marker: { latitude: 45.45828550714655, longitude: -73.640346666505855 },
    addressLines: ["7141 Sherbrooke St. W."],
    polygon: [
      { latitude: 45.45852087193103, longitude: -73.6406895128955 },
      { latitude: 45.45822259635017, longitude: -73.63989948697487 },
      { latitude: 45.458078848518866, longitude: -73.64001527546907 },
      { latitude: 45.45837856233265, longitude: -73.6407950546203 },
    ],

    openingHours: { label: "Mon-Fri 7:00-23:00" },
    hasStudySpots: true,

    image: require("../../assets/buildings/cc.jpg"),

    accessibility: {
      hasElevator: true,
      hasParking: false,
      isAccessible: true,
    },
  },
  {
    id: "SC",
    name: "Student Centre",
    marker: { latitude: 45.459121999518935, longitude: -73.63921863357234 },
    addressLines: ["7141 Sherbrooke St. W."],
    polygon: [
      { latitude: 45.458996441307576, longitude: -73.63912084321551 },
      { latitude: 45.459124324668366, longitude: -73.63944239116847 },
      { latitude: 45.45934288828713, longitude: -73.63925012538324 },
      { latitude: 45.45921616799489, longitude: -73.63892526250292 },
    ],

    openingHours: { label: "Mon-Fri 10:00-16:00" },
    hasStudySpots: false,

    image: require("../../assets/buildings/sc.jpg"),

    accessibility: {
      hasElevator: false,
      hasParking: false,
      isAccessible: true,
    },
  },
  {
    id: "HB",
    name: "Hingston Hall, wing HB",
    marker: { latitude: 45.459356110681796, longitude: -73.64181880514379 },
    addressLines: ["7141 Sherbrooke St. W."],
    polygon: [
      { latitude: 45.45953105655869, longitude: -73.64191644586813 },
      { latitude: 45.459368316226254, longitude: -73.64149784751503 },
      { latitude: 45.459163313079976, longitude: -73.64166086752297 },
      { latitude: 45.45932604946066, longitude: -73.64209270318477 },
    ],

    openingHours: { label: "~Mon-Fri 10:00-16:00, May Vary" },
    hasStudySpots: false,

    image: require("../../assets/buildings/hb.jpg"),

    accessibility: {
      hasElevator: false,
      hasParking: false,
      isAccessible: true,
    },
  },

];
