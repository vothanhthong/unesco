export interface CommunityComment {
  id: string;
  scamId: string;
  user: string;
  comment: string;
  date: string;
}

export const mockComments: CommunityComment[] = [
  { id: "c1", scamId: "s1", user: "Khanh", comment: "I received the same message last month. The sender used a fake bank website.", date: "2026-08-01" },
  { id: "c2", scamId: "s1", user: "Mai", comment: "The URL looked suspicious and the message created fear right away.", date: "2026-08-02" },
  { id: "c3", scamId: "s2", user: "Nam", comment: "They created pressure by saying the person had a legal issue.", date: "2026-08-03" },
  { id: "c4", scamId: "s2", user: "Vy", comment: "This scam uses authority and urgency together, which is very convincing.", date: "2026-08-02" },
  { id: "c5", scamId: "s3", user: "Linh", comment: "It looked like a prize message but the process asked for a fee too early.", date: "2026-08-01" },
  { id: "c6", scamId: "s4", user: "Thu", comment: "The promise of guaranteed profit is the biggest warning sign here.", date: "2026-07-30" },
  { id: "c7", scamId: "s5", user: "An", comment: "The message tried to create panic by saying the package was stuck at customs.", date: "2026-07-29" },
  { id: "c8", scamId: "s6", user: "Duc", comment: "The fake recruiter claimed remote work needed no experience, which is a red flag.", date: "2026-07-28" },
  { id: "c9", scamId: "s7", user: "Duy", comment: "The site looked official, but the app update request was strange from the start.", date: "2026-07-27" },
  { id: "c10", scamId: "s8", user: "Hoa", comment: "This used a school context to trigger fear and make the request feel real.", date: "2026-07-26" },
  { id: "c11", scamId: "s9", user: "Tuan", comment: "They asked for PIN codes after a fake payment alert, which is a classic trap.", date: "2026-07-24" },
  { id: "c12", scamId: "s10", user: "Lan", comment: "Everything seemed too easy and fast, which is why I closed it immediately.", date: "2026-07-23" },
  { id: "c13", scamId: "s11", user: "Minh", comment: "The fake security email looked realistic but the link routes to a unknown portal.", date: "2026-07-22" },
  { id: "c14", scamId: "s12", user: "Tram", comment: "The wording used official authority but no clear proof.", date: "2026-07-21" },
  { id: "c15", scamId: "s13", user: "Quang", comment: "The delayed package notice was designed to make people act before thinking.", date: "2026-07-20" },
  { id: "c16", scamId: "s14", user: "Nhi", comment: "It looked like a win but the small fee requirement was the giveaway.", date: "2026-07-18" },
  { id: "c17", scamId: "s15", user: "Huy", comment: "The job sounded too good to be true and the hiring steps were vague.", date: "2026-07-17" },
  { id: "c18", scamId: "s16", user: "Ben", comment: "There was no real verification path and the message asked for personal info quickly.", date: "2026-07-16" },
  { id: "c19", scamId: "s17", user: "Nga", comment: "Scarcity and exclusivity were used to pressure fast action.", date: "2026-07-15" },
  { id: "c20", scamId: "s18", user: "Binh", comment: "The fake account verification page was the risky part.", date: "2026-07-13" },
  { id: "c21", scamId: "s19", user: "Khoa", comment: "The scam relied on fear of losing access to a loan approval.", date: "2026-07-12" },
  { id: "c22", scamId: "s20", user: "Em", comment: "The request sounded like a family member but the urgency was suspicious.", date: "2026-07-10" },
  { id: "c23", scamId: "s3", user: "Yen", comment: "I noticed they never provided any official verification process.", date: "2026-08-04" },
  { id: "c24", scamId: "s5", user: "Long", comment: "The fake shipping fee was a reminder not to click links from unexpected messages.", date: "2026-08-03" },
  { id: "c25", scamId: "s7", user: "Hoang", comment: "This one used trust in a familiar brand name to lower suspicion.", date: "2026-08-05" },
  { id: "c26", scamId: "s9", user: "Khiem", comment: "The scam wanted a PIN immediately after a payment notice, which is not normal.", date: "2026-08-04" },
  { id: "c27", scamId: "s11", user: "Oanh", comment: "The threat was immediate, and the fake recovery page asked for the account password.", date: "2026-08-02" },
  { id: "c28", scamId: "s13", user: "Pha", comment: "Delivery scams often create urgency before a customer even checks the official app.", date: "2026-08-06" },
  { id: "c29", scamId: "s17", user: "Luan", comment: "The invitation sounded exclusive but the lack of proof was the giveaway.", date: "2026-08-05" },
  { id: "c30", scamId: "s20", user: "Quynh", comment: "Family scams usually work because they play on trust and fear at the same time.", date: "2026-08-07" },
];
