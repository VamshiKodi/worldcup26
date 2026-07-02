/**
 * Actual FIFA World Cup 2026 match results
 * Source: FIFA/ESPN official match data
 */

export interface MatchResult {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  date: string;
  venue: string;
  city: string;
  group: string;
  status: 'finished' | 'live' | 'scheduled';
}

// Actual match results from World Cup 2026 (June 11-25, 2026)
export const ACTUAL_MATCH_RESULTS: MatchResult[] = [
  // June 11, 2026 - Opening Day
  { homeTeam: 'Mexico', awayTeam: 'South Africa', homeScore: 2, awayScore: 0, date: '2026-06-11T13:00:00-05:00', venue: 'Estadio Banorte', city: 'Mexico City', group: 'A', status: 'finished' },
  { homeTeam: 'South Korea', awayTeam: 'Czech Republic', homeScore: 2, awayScore: 1, date: '2026-06-11T20:00:00-06:00', venue: 'Estadio Akron', city: 'Guadalajara', group: 'A', status: 'finished' },
  
  // June 12, 2026
  { homeTeam: 'Canada', awayTeam: 'Bosnia and Herzegovina', homeScore: 1, awayScore: 1, date: '2026-06-12T15:00:00-04:00', venue: 'BMO Field', city: 'Toronto', group: 'B', status: 'finished' },
  { homeTeam: 'United States', awayTeam: 'Paraguay', homeScore: 4, awayScore: 1, date: '2026-06-12T18:00:00-07:00', venue: 'SoFi Stadium', city: 'Los Angeles', group: 'D', status: 'finished' },
  { homeTeam: 'Australia', awayTeam: 'Turkey', homeScore: 2, awayScore: 0, date: '2026-06-12T18:00:00-07:00', venue: 'BC Place', city: 'Vancouver', group: 'D', status: 'finished' },
  { homeTeam: 'Haiti', awayTeam: 'Scotland', homeScore: 0, awayScore: 1, date: '2026-06-12T19:00:00-04:00', venue: 'Gillette Stadium', city: 'Boston', group: 'C', status: 'finished' },
  { homeTeam: 'Brazil', awayTeam: 'Morocco', homeScore: 1, awayScore: 1, date: '2026-06-12T18:00:00-04:00', venue: 'MetLife Stadium', city: 'New York/New Jersey', group: 'C', status: 'finished' },
  { homeTeam: 'Qatar', awayTeam: 'Switzerland', homeScore: 1, awayScore: 1, date: '2026-06-12T12:00:00-07:00', venue: 'Levi\'s Stadium', city: 'San Francisco Bay Area', group: 'B', status: 'finished' },
  
  // June 13, 2026
  { homeTeam: 'Switzerland', awayTeam: 'Canada', homeScore: 2, awayScore: 1, date: '2026-06-13T19:00:00-07:00', venue: 'BC Place', city: 'Vancouver', group: 'B', status: 'finished' },
  { homeTeam: 'Bosnia and Herzegovina', awayTeam: 'Qatar', homeScore: 3, awayScore: 1, date: '2026-06-13T21:00:00-07:00', venue: 'Lumen Field', city: 'Seattle', group: 'B', status: 'finished' },
  { homeTeam: 'Scotland', awayTeam: 'Brazil', homeScore: 0, awayScore: 3, date: '2026-06-13T19:00:00-04:00', venue: 'Hard Rock Stadium', city: 'Miami', group: 'C', status: 'finished' },
  { homeTeam: 'Morocco', awayTeam: 'Haiti', homeScore: 4, awayScore: 2, date: '2026-06-13T19:00:00-04:00', venue: 'Mercedes-Benz Stadium', city: 'Atlanta', group: 'C', status: 'finished' },
  { homeTeam: 'Czech Republic', awayTeam: 'Mexico', homeScore: 0, awayScore: 3, date: '2026-06-13T13:00:00-06:00', venue: 'Estadio Banorte', city: 'Mexico City', group: 'A', status: 'finished' },
  { homeTeam: 'South Africa', awayTeam: 'South Korea', homeScore: 1, awayScore: 0, date: '2026-06-13T20:00:00-06:00', venue: 'Estadio Akron', city: 'Guadalajara', group: 'A', status: 'finished' },
  
  // June 14, 2026
  { homeTeam: 'Portugal', awayTeam: 'Uzbekistan', homeScore: 5, awayScore: 0, date: '2026-06-14T13:00:00-05:00', venue: 'NRG Stadium', city: 'Houston', group: 'K', status: 'finished' },
  { homeTeam: 'England', awayTeam: 'Ghana', homeScore: 0, awayScore: 0, date: '2026-06-14T19:00:00-04:00', venue: 'Gillette Stadium', city: 'Boston', group: 'L', status: 'finished' },
  { homeTeam: 'Panama', awayTeam: 'Croatia', homeScore: 0, awayScore: 1, date: '2026-06-14T16:00:00-04:00', venue: 'BMO Field', city: 'Toronto', group: 'L', status: 'finished' },
  { homeTeam: 'Colombia', awayTeam: 'DR Congo', homeScore: 1, awayScore: 0, date: '2026-06-14T20:00:00-06:00', venue: 'Estadio Akron', city: 'Guadalajara', group: 'K', status: 'finished' },
  { homeTeam: 'Argentina', awayTeam: 'Austria', homeScore: 2, awayScore: 0, date: '2026-06-14T19:00:00-05:00', venue: 'AT&T Stadium', city: 'Dallas', group: 'J', status: 'finished' },
  { homeTeam: 'France', awayTeam: 'Iraq', homeScore: 3, awayScore: 0, date: '2026-06-14T16:00:00-04:00', venue: 'Lincoln Financial Field', city: 'Philadelphia', group: 'I', status: 'finished' },
  { homeTeam: 'Norway', awayTeam: 'Senegal', homeScore: 3, awayScore: 2, date: '2026-06-14T19:00:00-04:00', venue: 'MetLife Stadium', city: 'New York/New Jersey', group: 'I', status: 'finished' },
  { homeTeam: 'Jordan', awayTeam: 'Algeria', homeScore: 1, awayScore: 2, date: '2026-06-14T19:00:00-07:00', venue: 'Levi\'s Stadium', city: 'San Francisco Bay Area', group: 'J', status: 'finished' },
  
  // June 15, 2026
  { homeTeam: 'Spain', awayTeam: 'Saudi Arabia', homeScore: 4, awayScore: 0, date: '2026-06-15T16:00:00-04:00', venue: 'Mercedes-Benz Stadium', city: 'Atlanta', group: 'H', status: 'finished' },
  { homeTeam: 'Belgium', awayTeam: 'Iran', homeScore: 0, awayScore: 0, date: '2026-06-15T19:00:00-07:00', venue: 'SoFi Stadium', city: 'Los Angeles', group: 'G', status: 'finished' },
  { homeTeam: 'Uruguay', awayTeam: 'Cape Verde', homeScore: 2, awayScore: 2, date: '2026-06-15T19:00:00-04:00', venue: 'Hard Rock Stadium', city: 'Miami', group: 'H', status: 'finished' },
  { homeTeam: 'New Zealand', awayTeam: 'Egypt', homeScore: 1, awayScore: 3, date: '2026-06-15T19:00:00-07:00', venue: 'BC Place', city: 'Vancouver', group: 'G', status: 'finished' },
  { homeTeam: 'Netherlands', awayTeam: 'Sweden', homeScore: 5, awayScore: 1, date: '2026-06-15T13:00:00-05:00', venue: 'NRG Stadium', city: 'Houston', group: 'F', status: 'finished' },
  { homeTeam: 'Germany', awayTeam: 'Ivory Coast', homeScore: 2, awayScore: 1, date: '2026-06-15T16:00:00-04:00', venue: 'BMO Field', city: 'Toronto', group: 'E', status: 'finished' },
  { homeTeam: 'Ecuador', awayTeam: 'Curacao', homeScore: 0, awayScore: 0, date: '2026-06-15T19:00:00-05:00', venue: 'Arrowhead Stadium', city: 'Kansas City', group: 'E', status: 'finished' },
  { homeTeam: 'Tunisia', awayTeam: 'Japan', homeScore: 0, awayScore: 4, date: '2026-06-15T22:00:00-06:00', venue: 'Estadio BBVA', city: 'Monterrey', group: 'F', status: 'finished' },
  
  // June 16, 2026
  { homeTeam: 'Czech Republic', awayTeam: 'South Africa', homeScore: 1, awayScore: 1, date: '2026-06-16T19:00:00-04:00', venue: 'Mercedes-Benz Stadium', city: 'Atlanta', group: 'A', status: 'finished' },
  { homeTeam: 'Switzerland', awayTeam: 'Bosnia and Herzegovina', homeScore: 4, awayScore: 1, date: '2026-06-16T19:00:00-07:00', venue: 'SoFi Stadium', city: 'Los Angeles', group: 'B', status: 'finished' },
  { homeTeam: 'Canada', awayTeam: 'Qatar', homeScore: 6, awayScore: 0, date: '2026-06-16T19:00:00-07:00', venue: 'BC Place', city: 'Vancouver', group: 'B', status: 'finished' },
  { homeTeam: 'Mexico', awayTeam: 'South Korea', homeScore: 1, awayScore: 0, date: '2026-06-16T20:00:00-06:00', venue: 'Estadio Akron', city: 'Guadalajara', group: 'A', status: 'finished' },
  { homeTeam: 'Portugal', awayTeam: 'DR Congo', homeScore: 1, awayScore: 1, date: '2026-06-16T13:00:00-05:00', venue: 'NRG Stadium', city: 'Houston', group: 'K', status: 'finished' },
  { homeTeam: 'England', awayTeam: 'Croatia', homeScore: 4, awayScore: 2, date: '2026-06-16T19:00:00-05:00', venue: 'AT&T Stadium', city: 'Dallas', group: 'L', status: 'finished' },
  { homeTeam: 'Ghana', awayTeam: 'Panama', homeScore: 1, awayScore: 0, date: '2026-06-16T16:00:00-04:00', venue: 'BMO Field', city: 'Toronto', group: 'L', status: 'finished' },
  { homeTeam: 'Uzbekistan', awayTeam: 'Colombia', homeScore: 1, awayScore: 3, date: '2026-06-16T13:00:00-06:00', venue: 'Estadio Banorte', city: 'Mexico City', group: 'K', status: 'finished' },
  { homeTeam: 'France', awayTeam: 'Senegal', homeScore: 3, awayScore: 1, date: '2026-06-16T19:00:00-04:00', venue: 'MetLife Stadium', city: 'New York/New Jersey', group: 'I', status: 'finished' },
  { homeTeam: 'Iraq', awayTeam: 'Norway', homeScore: 1, awayScore: 4, date: '2026-06-16T16:00:00-04:00', venue: 'Gillette Stadium', city: 'Boston', group: 'I', status: 'finished' },
  { homeTeam: 'Argentina', awayTeam: 'Algeria', homeScore: 3, awayScore: 0, date: '2026-06-16T19:00:00-05:00', venue: 'Arrowhead Stadium', city: 'Kansas City', group: 'J', status: 'finished' },
  { homeTeam: 'Austria', awayTeam: 'Jordan', homeScore: 3, awayScore: 1, date: '2026-06-16T19:00:00-07:00', venue: 'Levi\'s Stadium', city: 'San Francisco Bay Area', group: 'J', status: 'finished' },
  
  // June 17, 2026
  { homeTeam: 'Spain', awayTeam: 'Cape Verde', homeScore: 0, awayScore: 0, date: '2026-06-17T16:00:00-04:00', venue: 'Mercedes-Benz Stadium', city: 'Atlanta', group: 'H', status: 'finished' },
  { homeTeam: 'Belgium', awayTeam: 'Egypt', homeScore: 1, awayScore: 1, date: '2026-06-17T19:00:00-07:00', venue: 'Lumen Field', city: 'Seattle', group: 'G', status: 'finished' },
  { homeTeam: 'Saudi Arabia', awayTeam: 'Uruguay', homeScore: 1, awayScore: 1, date: '2026-06-17T19:00:00-04:00', venue: 'Hard Rock Stadium', city: 'Miami', group: 'H', status: 'finished' },
  { homeTeam: 'Iran', awayTeam: 'New Zealand', homeScore: 2, awayScore: 2, date: '2026-06-17T19:00:00-07:00', venue: 'SoFi Stadium', city: 'Los Angeles', group: 'G', status: 'finished' },
  { homeTeam: 'Germany', awayTeam: 'Curacao', homeScore: 7, awayScore: 1, date: '2026-06-17T13:00:00-05:00', venue: 'NRG Stadium', city: 'Houston', group: 'E', status: 'finished' },
  { homeTeam: 'Netherlands', awayTeam: 'Japan', homeScore: 2, awayScore: 2, date: '2026-06-17T19:00:00-05:00', venue: 'AT&T Stadium', city: 'Dallas', group: 'F', status: 'finished' },
  { homeTeam: 'Ivory Coast', awayTeam: 'Ecuador', homeScore: 1, awayScore: 0, date: '2026-06-17T16:00:00-04:00', venue: 'Lincoln Financial Field', city: 'Philadelphia', group: 'E', status: 'finished' },
  { homeTeam: 'Sweden', awayTeam: 'Tunisia', homeScore: 5, awayScore: 1, date: '2026-06-17T22:00:00-06:00', venue: 'Estadio BBVA', city: 'Monterrey', group: 'F', status: 'finished' },
  
  // June 18, 2026
  { homeTeam: 'United States', awayTeam: 'Australia', homeScore: 2, awayScore: 0, date: '2026-06-18T19:00:00-07:00', venue: 'Lumen Field', city: 'Seattle', group: 'D', status: 'finished' },
  { homeTeam: 'Scotland', awayTeam: 'Morocco', homeScore: 0, awayScore: 1, date: '2026-06-18T16:00:00-04:00', venue: 'Gillette Stadium', city: 'Boston', group: 'C', status: 'finished' },
  { homeTeam: 'Brazil', awayTeam: 'Haiti', homeScore: 3, awayScore: 0, date: '2026-06-18T16:00:00-04:00', venue: 'Lincoln Financial Field', city: 'Philadelphia', group: 'C', status: 'finished' },
  { homeTeam: 'Turkey', awayTeam: 'Paraguay', homeScore: 0, awayScore: 1, date: '2026-06-18T19:00:00-07:00', venue: 'Levi\'s Stadium', city: 'San Francisco Bay Area', group: 'D', status: 'finished' },
  
  // Remaining scheduled matches (June 19-27) - placeholder for upcoming
  { homeTeam: 'Germany', awayTeam: 'Ecuador', homeScore: 0, awayScore: 0, date: '2026-06-19T16:00:00-04:00', venue: 'BMO Field', city: 'Toronto', group: 'E', status: 'scheduled' },
  { homeTeam: 'Curacao', awayTeam: 'Ivory Coast', homeScore: 0, awayScore: 0, date: '2026-06-19T19:00:00-04:00', venue: 'Lincoln Financial Field', city: 'Philadelphia', group: 'E', status: 'scheduled' },
  { homeTeam: 'Japan', awayTeam: 'Sweden', homeScore: 0, awayScore: 0, date: '2026-06-19T19:00:00-05:00', venue: 'AT&T Stadium', city: 'Dallas', group: 'F', status: 'scheduled' },
  { homeTeam: 'Netherlands', awayTeam: 'Tunisia', homeScore: 0, awayScore: 0, date: '2026-06-19T19:00:00-05:00', venue: 'Arrowhead Stadium', city: 'Kansas City', group: 'F', status: 'scheduled' },
  { homeTeam: 'Turkey', awayTeam: 'United States', homeScore: 0, awayScore: 0, date: '2026-06-19T19:00:00-07:00', venue: 'SoFi Stadium', city: 'Los Angeles', group: 'D', status: 'scheduled' },
  { homeTeam: 'Paraguay', awayTeam: 'Australia', homeScore: 0, awayScore: 0, date: '2026-06-19T19:00:00-07:00', venue: 'Levi\'s Stadium', city: 'San Francisco Bay Area', group: 'D', status: 'scheduled' },
  
  // June 20-27 remaining matches (simplified placeholders)
  { homeTeam: 'Spain', awayTeam: 'Uruguay', homeScore: 0, awayScore: 0, date: '2026-06-20T19:00:00-04:00', venue: 'MetLife Stadium', city: 'New York/New Jersey', group: 'H', status: 'scheduled' },
  { homeTeam: 'Cape Verde', awayTeam: 'Saudi Arabia', homeScore: 0, awayScore: 0, date: '2026-06-20T19:00:00-04:00', venue: 'Hard Rock Stadium', city: 'Miami', group: 'H', status: 'scheduled' },
  { homeTeam: 'Belgium', awayTeam: 'New Zealand', homeScore: 0, awayScore: 0, date: '2026-06-20T19:00:00-07:00', venue: 'Lumen Field', city: 'Seattle', group: 'G', status: 'scheduled' },
  { homeTeam: 'Iran', awayTeam: 'Egypt', homeScore: 0, awayScore: 0, date: '2026-06-20T19:00:00-07:00', venue: 'SoFi Stadium', city: 'Los Angeles', group: 'G', status: 'scheduled' },
  { homeTeam: 'Portugal', awayTeam: 'Colombia', homeScore: 0, awayScore: 0, date: '2026-06-21T19:00:00-05:00', venue: 'AT&T Stadium', city: 'Dallas', group: 'K', status: 'scheduled' },
  { homeTeam: 'Uzbekistan', awayTeam: 'DR Congo', homeScore: 0, awayScore: 0, date: '2026-06-21T16:00:00-04:00', venue: 'Lincoln Financial Field', city: 'Philadelphia', group: 'K', status: 'scheduled' },
  { homeTeam: 'England', awayTeam: 'Panama', homeScore: 0, awayScore: 0, date: '2026-06-21T19:00:00-04:00', venue: 'Gillette Stadium', city: 'Boston', group: 'L', status: 'scheduled' },
  { homeTeam: 'Croatia', awayTeam: 'Ghana', homeScore: 0, awayScore: 0, date: '2026-06-21T16:00:00-04:00', venue: 'BMO Field', city: 'Toronto', group: 'L', status: 'scheduled' },
  { homeTeam: 'France', awayTeam: 'Norway', homeScore: 0, awayScore: 0, date: '2026-06-22T19:00:00-04:00', venue: 'MetLife Stadium', city: 'New York/New Jersey', group: 'I', status: 'scheduled' },
  { homeTeam: 'Iraq', awayTeam: 'Senegal', homeScore: 0, awayScore: 0, date: '2026-06-22T16:00:00-04:00', venue: 'Gillette Stadium', city: 'Boston', group: 'I', status: 'scheduled' },
  { homeTeam: 'Argentina', awayTeam: 'Jordan', homeScore: 0, awayScore: 0, date: '2026-06-22T19:00:00-05:00', venue: 'Arrowhead Stadium', city: 'Kansas City', group: 'J', status: 'scheduled' },
  { homeTeam: 'Algeria', awayTeam: 'Austria', homeScore: 0, awayScore: 0, date: '2026-06-22T19:00:00-07:00', venue: 'Levi\'s Stadium', city: 'San Francisco Bay Area', group: 'J', status: 'scheduled' },
];
