/**
 * Static seed data for the 2026 format (48 teams / 12 groups of 4).
 * Team selection/rankings are representative for development, not official.
 */

export interface SeedTeam {
  name: string;
  code: string;
  confederation: 'UEFA' | 'CONMEBOL' | 'CONCACAF' | 'CAF' | 'AFC' | 'OFC';
  fifaRanking: number;
  isHost?: boolean;
  group: string; // 'A'..'L'
}

// 12 groups (A–L), 4 teams each - Actual World Cup 2026 groups
export const SEED_TEAMS: SeedTeam[] = [
  // Group A: Mexico, Czech Republic, South Africa, South Korea
  { name: 'Mexico', code: 'MEX', confederation: 'CONCACAF', fifaRanking: 15, isHost: true, group: 'A' },
  { name: 'Czech Republic', code: 'CZE', confederation: 'UEFA', fifaRanking: 32, group: 'A' },
  { name: 'South Africa', code: 'RSA', confederation: 'CAF', fifaRanking: 58, group: 'A' },
  { name: 'South Korea', code: 'KOR', confederation: 'AFC', fifaRanking: 23, group: 'A' },
  // Group B: Canada, Bosnia and Herzegovina, Qatar, Switzerland
  { name: 'Canada', code: 'CAN', confederation: 'CONCACAF', fifaRanking: 48, isHost: true, group: 'B' },
  { name: 'Bosnia and Herzegovina', code: 'BIH', confederation: 'UEFA', fifaRanking: 55, group: 'B' },
  { name: 'Qatar', code: 'QAT', confederation: 'AFC', fifaRanking: 35, group: 'B' },
  { name: 'Switzerland', code: 'SUI', confederation: 'UEFA', fifaRanking: 19, group: 'B' },
  // Group C: Brazil, Haiti, Morocco, Scotland
  { name: 'Brazil', code: 'BRA', confederation: 'CONMEBOL', fifaRanking: 5, group: 'C' },
  { name: 'Haiti', code: 'HAI', confederation: 'CONCACAF', fifaRanking: 85, group: 'C' },
  { name: 'Morocco', code: 'MAR', confederation: 'CAF', fifaRanking: 13, group: 'C' },
  { name: 'Scotland', code: 'SCO', confederation: 'UEFA', fifaRanking: 45, group: 'C' },
  // Group D: United States, Australia, Paraguay, Turkey
  { name: 'United States', code: 'USA', confederation: 'CONCACAF', fifaRanking: 11, isHost: true, group: 'D' },
  { name: 'Australia', code: 'AUS', confederation: 'AFC', fifaRanking: 24, group: 'D' },
  { name: 'Paraguay', code: 'PAR', confederation: 'CONMEBOL', fifaRanking: 56, group: 'D' },
  { name: 'Turkey', code: 'TUR', confederation: 'UEFA', fifaRanking: 42, group: 'D' },
  // Group E: Curacao, Ecuador, Germany, Ivory Coast
  { name: 'Curacao', code: 'CUW', confederation: 'CONCACAF', fifaRanking: 86, group: 'E' },
  { name: 'Ecuador', code: 'ECU', confederation: 'CONMEBOL', fifaRanking: 31, group: 'E' },
  { name: 'Germany', code: 'GER', confederation: 'UEFA', fifaRanking: 16, group: 'E' },
  { name: 'Ivory Coast', code: 'CIV', confederation: 'CAF', fifaRanking: 40, group: 'E' },
  // Group F: Netherlands, Japan, Sweden, Tunisia
  { name: 'Netherlands', code: 'NED', confederation: 'UEFA', fifaRanking: 7, group: 'F' },
  { name: 'Japan', code: 'JPN', confederation: 'AFC', fifaRanking: 18, group: 'F' },
  { name: 'Sweden', code: 'SWE', confederation: 'UEFA', fifaRanking: 26, group: 'F' },
  { name: 'Tunisia', code: 'TUN', confederation: 'CAF', fifaRanking: 28, group: 'F' },
  // Group G: Belgium, Egypt, Iran, New Zealand
  { name: 'Belgium', code: 'BEL', confederation: 'UEFA', fifaRanking: 6, group: 'G' },
  { name: 'Egypt', code: 'EGY', confederation: 'CAF', fifaRanking: 36, group: 'G' },
  { name: 'Iran', code: 'IRN', confederation: 'AFC', fifaRanking: 20, group: 'G' },
  { name: 'New Zealand', code: 'NZL', confederation: 'OFC', fifaRanking: 95, group: 'G' },
  // Group H: Cape Verde, Saudi Arabia, Spain, Uruguay
  { name: 'Cape Verde', code: 'CPV', confederation: 'CAF', fifaRanking: 65, group: 'H' },
  { name: 'Saudi Arabia', code: 'KSA', confederation: 'AFC', fifaRanking: 56, group: 'H' },
  { name: 'Spain', code: 'ESP', confederation: 'UEFA', fifaRanking: 8, group: 'H' },
  { name: 'Uruguay', code: 'URU', confederation: 'CONMEBOL', fifaRanking: 16, group: 'H' },
  // Group I: France, Norway, Senegal, Iraq
  { name: 'France', code: 'FRA', confederation: 'UEFA', fifaRanking: 2, group: 'I' },
  { name: 'Norway', code: 'NOR', confederation: 'UEFA', fifaRanking: 43, group: 'I' },
  { name: 'Senegal', code: 'SEN', confederation: 'CAF', fifaRanking: 17, group: 'I' },
  { name: 'Iraq', code: 'IRQ', confederation: 'AFC', fifaRanking: 55, group: 'I' },
  // Group J: Algeria, Argentina, Austria, Jordan
  { name: 'Algeria', code: 'DZA', confederation: 'CAF', fifaRanking: 33, group: 'J' },
  { name: 'Argentina', code: 'ARG', confederation: 'CONMEBOL', fifaRanking: 1, group: 'J' },
  { name: 'Austria', code: 'AUT', confederation: 'UEFA', fifaRanking: 25, group: 'J' },
  { name: 'Jordan', code: 'JOR', confederation: 'AFC', fifaRanking: 70, group: 'J' },
  // Group K: Colombia, DR Congo, Portugal, Uzbekistan
  { name: 'Colombia', code: 'COL', confederation: 'CONMEBOL', fifaRanking: 12, group: 'K' },
  { name: 'DR Congo', code: 'COD', confederation: 'CAF', fifaRanking: 55, group: 'K' },
  { name: 'Portugal', code: 'POR', confederation: 'UEFA', fifaRanking: 3, group: 'K' },
  { name: 'Uzbekistan', code: 'UZB', confederation: 'AFC', fifaRanking: 60, group: 'K' },
  // Group L: Croatia, England, Ghana, Panama
  { name: 'Croatia', code: 'CRO', confederation: 'UEFA', fifaRanking: 10, group: 'L' },
  { name: 'England', code: 'ENG', confederation: 'UEFA', fifaRanking: 4, group: 'L' },
  { name: 'Ghana', code: 'GHA', confederation: 'CAF', fifaRanking: 68, group: 'L' },
  { name: 'Panama', code: 'PAN', confederation: 'CONCACAF', fifaRanking: 50, group: 'L' },
];

export const GROUP_NAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

// Star players across the field for the showcase / golden-boot race.
// Headshots are Wikipedia/Wikimedia thumbnails resolved by player name.
// Only players from teams in the actual World Cup 2026 groups
export const SEED_PLAYERS = [
  { name: "Lionel Messi", code: "ARG", position: "FW", number: 10, club: "Inter Miami", age: 38, goals: 4, assists: 3, xg: 3.6, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Lionel_Messi_NE_Revolution_Inter_Miami_7.9.25-178_%28cropped_2%29.jpg/330px-Lionel_Messi_NE_Revolution_Inter_Miami_7.9.25-178_%28cropped_2%29.jpg" },
  { name: "Julián Álvarez", code: "ARG", position: "FW", number: 9, club: "Atlético Madrid", age: 26, goals: 3, assists: 2, xg: 3.1, photo: "https://upload.wikimedia.org/wikipedia/commons/0/03/Argentina_national_football_team_-_2_-_2022_%28Juli%C3%A1n_%C3%81lvarez%29.jpg" },
  { name: "Enzo Fernández", code: "ARG", position: "MF", number: 24, club: "Chelsea", age: 25, goals: 1, assists: 3, xg: 1.2, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Enzo_Fern%C3%A1ndez_2025_FIFA_Club_World_Cup_Final.jpg/330px-Enzo_Fern%C3%A1ndez_2025_FIFA_Club_World_Cup_Final.jpg" },
  { name: "Lautaro Martínez", code: "ARG", position: "FW", number: 22, club: "Inter", age: 28, goals: 4, assists: 0, xg: 3.4, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Lautaro_Martinez_ARGENTINA_VS_VENEZUELA_2017.jpg/330px-Lautaro_Martinez_ARGENTINA_VS_VENEZUELA_2017.jpg" },
  { name: "Kylian Mbappé", code: "FRA", position: "FW", number: 10, club: "Real Madrid", age: 27, goals: 5, assists: 2, xg: 4.9, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Picture_with_Mbapp%C3%A9_%28cropped_and_rotated%29.jpg/330px-Picture_with_Mbapp%C3%A9_%28cropped_and_rotated%29.jpg" },
  { name: "Antoine Griezmann", code: "FRA", position: "FW", number: 7, club: "Atlético Madrid", age: 35, goals: 2, assists: 3, xg: 2.1, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/FRA-ARG_%2810%29_%28cropped%29.jpg/330px-FRA-ARG_%2810%29_%28cropped%29.jpg" },
  { name: "Aurélien Tchouaméni", code: "FRA", position: "MF", number: 8, club: "Real Madrid", age: 26, goals: 1, assists: 1, xg: 0.8, photo: "https://upload.wikimedia.org/wikipedia/commons/0/0f/2025_04_26_Final_de_la_Copa_del_Rey_-_Aur%C3%A9lien_Tchouam%C3%A9ni.jpg" },
  { name: "Mike Maignan", code: "FRA", position: "GK", number: 1, club: "AC Milan", age: 30, goals: 0, assists: 0, xg: 0, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Mike_Maignan_2022_Salzburg_vs_AC_Milan_2022-09-06.jpg/330px-Mike_Maignan_2022_Salzburg_vs_AC_Milan_2022-09-06.jpg" },
  { name: "Vinícius Júnior", code: "BRA", position: "FW", number: 7, club: "Real Madrid", age: 25, goals: 3, assists: 4, xg: 2.8, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Vin%C3%ADcius_J%C3%BAnior_Brazil_V_Morocco_13_June_2026-207_%28cropped%29.jpg/330px-Vin%C3%ADcius_J%C3%BAnior_Brazil_V_Morocco_13_June_2026-207_%28cropped%29.jpg" },
  { name: "Rodrygo", code: "BRA", position: "FW", number: 11, club: "Real Madrid", age: 25, goals: 2, assists: 2, xg: 2, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Rodrygo_2023_%28cropped%29.jpg/330px-Rodrygo_2023_%28cropped%29.jpg" },
  { name: "Neymar", code: "BRA", position: "FW", number: 10, club: "Santos FC", age: 34, goals: 2, assists: 3, xg: 2.2, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Neymar_Junior_Brazil_V_Morocco_13_June_2026-40.jpg/330px-Neymar_Junior_Brazil_V_Morocco_13_June_2026-40.jpg" },
  { name: "Casemiro", code: "BRA", position: "MF", number: 5, club: "Manchester United", age: 34, goals: 1, assists: 0, xg: 0.6, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Casemiro_Brazil_V_Morocco_13_June_2026-76_%28cropped%29.jpg/330px-Casemiro_Brazil_V_Morocco_13_June_2026-76_%28cropped%29.jpg" },
  { name: "Alisson", code: "BRA", position: "GK", number: 1, club: "Liverpool", age: 33, goals: 0, assists: 0, xg: 0, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Alisson_Becker_Brazil_V_Morocco_13_June_2026-117_%28cropped%29.jpg/330px-Alisson_Becker_Brazil_V_Morocco_13_June_2026-117_%28cropped%29.jpg" },
  { name: "Jude Bellingham", code: "ENG", position: "MF", number: 10, club: "Real Madrid", age: 22, goals: 2, assists: 2, xg: 1.9, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/25th_Laureus_World_Sports_Awards_-_Red_Carpet_-_Jude_Bellingham_-_240422_190551-2_%28cropped%29.jpg/330px-25th_Laureus_World_Sports_Awards_-_Red_Carpet_-_Jude_Bellingham_-_240422_190551-2_%28cropped%29.jpg" },
  { name: "Harry Kane", code: "ENG", position: "FW", number: 9, club: "Bayern Munich", age: 32, goals: 5, assists: 1, xg: 4.6, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Harry_Kane_on_October_10%2C_2023.jpg/330px-Harry_Kane_on_October_10%2C_2023.jpg" },
  { name: "Phil Foden", code: "ENG", position: "MF", number: 11, club: "Manchester City", age: 25, goals: 2, assists: 3, xg: 1.8, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/2023-10-04_Fu%C3%9Fball%2C_M%C3%A4nner%2C_UEFA_Champions_League%2C_RB_Leipzig_-_Manchester_City_FC_1DX_2613%2C_Phil_Foden.jpg/330px-2023-10-04_Fu%C3%9Fball%2C_M%C3%A4nner%2C_UEFA_Champions_League%2C_RB_Leipzig_-_Manchester_City_FC_1DX_2613%2C_Phil_Foden.jpg" },
  { name: "Bukayo Saka", code: "ENG", position: "FW", number: 7, club: "Arsenal", age: 24, goals: 3, assists: 3, xg: 2.5, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/RC_Lens_-_Arsenal_FC_%2803-10-2023%29_16_%28cropped%29.jpg/330px-RC_Lens_-_Arsenal_FC_%2803-10-2023%29_16_%28cropped%29.jpg" },
  { name: "Declan Rice", code: "ENG", position: "MF", number: 4, club: "Arsenal", age: 27, goals: 1, assists: 2, xg: 0.9, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Declan_Rice_-_53248276328_%28cropped%29.jpg/330px-Declan_Rice_-_53248276328_%28cropped%29.jpg" },
  { name: "Cristiano Ronaldo", code: "POR", position: "FW", number: 7, club: "Al-Nassr", age: 41, goals: 3, assists: 1, xg: 3.1, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Cristiano_Ronaldo_2275_%28cropped%29.jpg/330px-Cristiano_Ronaldo_2275_%28cropped%29.jpg" },
  { name: "Bruno Fernandes", code: "POR", position: "MF", number: 8, club: "Manchester United", age: 31, goals: 2, assists: 4, xg: 2, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Bruno_Fernandes_USMNT_v_Portugal_Mar_31_2026-27_%28cropped%29.jpg/330px-Bruno_Fernandes_USMNT_v_Portugal_Mar_31_2026-27_%28cropped%29.jpg" },
  { name: "Bernardo Silva", code: "POR", position: "MF", number: 10, club: "Manchester City", age: 31, goals: 1, assists: 2, xg: 1.1, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Bernardo_Silva_%28Isto_%C3%89_Gozar_Com_Quem_Trabalha%2C_2024%29.png/330px-Bernardo_Silva_%28Isto_%C3%89_Gozar_Com_Quem_Trabalha%2C_2024%29.png" },
  { name: "Rúben Dias", code: "POR", position: "DF", number: 4, club: "Manchester City", age: 28, goals: 0, assists: 0, xg: 0.2, photo: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Portugal_national_football_team_0866_%28R%C3%BAben_Dias%29.jpg" },
  { name: "Lamine Yamal", code: "ESP", position: "FW", number: 19, club: "Barcelona", age: 18, goals: 3, assists: 4, xg: 2.7, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Lamine_Yamal_a_Xina_%282025%29.png/330px-Lamine_Yamal_a_Xina_%282025%29.png" },
  { name: "Rodri", code: "ESP", position: "MF", number: 16, club: "Manchester City", age: 29, goals: 1, assists: 1, xg: 0.9, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/RODRI_-_SWE_vs_ESP_-_UEFA_EURO_2020_QUALIFIERS_-_2019.10.15_%28cropped%29.jpg/330px-RODRI_-_SWE_vs_ESP_-_UEFA_EURO_2020_QUALIFIERS_-_2019.10.15_%28cropped%29.jpg" },
  { name: "Pedri", code: "ESP", position: "MF", number: 8, club: "Barcelona", age: 23, goals: 1, assists: 3, xg: 1, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Pedri.jpg/330px-Pedri.jpg" },
  { name: "Álvaro Morata", code: "ESP", position: "FW", number: 7, club: "Como 1907", age: 33, goals: 3, assists: 1, xg: 2.8, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/%C3%81lvaro_Morata_in_2025.jpg/330px-%C3%81lvaro_Morata_in_2025.jpg" },
  { name: "Jamal Musiala", code: "GER", position: "MF", number: 10, club: "Bayern Munich", age: 23, goals: 3, assists: 3, xg: 2.6, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Jamal_Musiala_2022_%28cropped%29.jpg/330px-Jamal_Musiala_2022_%28cropped%29.jpg" },
  { name: "Florian Wirtz", code: "GER", position: "MF", number: 17, club: "Liverpool", age: 22, goals: 2, assists: 4, xg: 1.9, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Florian_Wirtz%2C_2022-07-31%2C_Saisoner%C3%B6ffnung_Bayer_04%2C_Leverkusen_%281%29_%28cropped%29.jpg/330px-Florian_Wirtz%2C_2022-07-31%2C_Saisoner%C3%B6ffnung_Bayer_04%2C_Leverkusen_%281%29_%28cropped%29.jpg" },
  { name: "Kai Havertz", code: "GER", position: "FW", number: 7, club: "Arsenal", age: 26, goals: 2, assists: 1, xg: 2.1, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/1_kai_havertz_2026_%28cropped%29.jpg/330px-1_kai_havertz_2026_%28cropped%29.jpg" },
  { name: "Joshua Kimmich", code: "GER", position: "MF", number: 6, club: "Bayern Munich", age: 31, goals: 1, assists: 2, xg: 0.8, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/2019-06-11_Fu%C3%9Fball%2C_M%C3%A4nner%2C_L%C3%A4nderspiel%2C_Deutschland-Estland_StP_2078_LR10_by_Stepro_%28cropped%29.jpg/330px-2019-06-11_Fu%C3%9Fball%2C_M%C3%A4nner%2C_L%C3%A4nderspiel%2C_Deutschland-Estland_StP_2078_LR10_by_Stepro_%28cropped%29.jpg" },
  { name: "Virgil van Dijk", code: "NED", position: "DF", number: 4, club: "Liverpool", age: 34, goals: 1, assists: 0, xg: 0.5, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/20160604_AUT_NED_8876_%28cropped%29.jpg/330px-20160604_AUT_NED_8876_%28cropped%29.jpg" },
  { name: "Cody Gakpo", code: "NED", position: "FW", number: 11, club: "Liverpool", age: 26, goals: 3, assists: 2, xg: 2.4, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Cody_Gakpo_06042025_%282%29_%28cropped%29.jpg/330px-Cody_Gakpo_06042025_%282%29_%28cropped%29.jpg" },
  { name: "Frenkie de Jong", code: "NED", position: "MF", number: 21, club: "Barcelona", age: 28, goals: 1, assists: 2, xg: 0.9, photo: "https://upload.wikimedia.org/wikipedia/commons/4/42/%D0%9C%D0%B0%D1%82%D1%87_%C2%AB%D0%94%D0%B8%D0%BD%D0%B0%D0%BC%D0%BE%C2%BB_-_%C2%AB%D0%91%D0%B0%D1%80%D1%81%D0%B5%D0%BB%D0%BE%D0%BD%D0%B0%C2%BB_0-1._2_%D0%BD%D0%BE%D1%8F%D0%B1%D1%80%D1%8F_2021_%D0%B3%D0%BE%D0%B4%D0%B0._II_%E2%80%94_1289671_%28cropped%29.jpg" },
  { name: "Kevin De Bruyne", code: "BEL", position: "MF", number: 7, club: "Napoli", age: 34, goals: 2, assists: 5, xg: 1.8, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Kevin_De_Bruyne_USMNT_v_Belgium_Mar_28_2026-64_%28cropped%29.jpg/330px-Kevin_De_Bruyne_USMNT_v_Belgium_Mar_28_2026-64_%28cropped%29.jpg" },
  { name: "Romelu Lukaku", code: "BEL", position: "FW", number: 9, club: "Napoli", age: 32, goals: 4, assists: 1, xg: 3.6, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Romelu_Lukaku_2021.jpg/330px-Romelu_Lukaku_2021.jpg" },
  { name: "Luka Modrić", code: "CRO", position: "MF", number: 10, club: "AC Milan", age: 40, goals: 1, assists: 2, xg: 0.7, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Ofrenda_de_la_Liga_y_la_Champions-57-L.Mill%C3%A1n_%2852109310843%29_%28Luka_Modri%C4%87%29.jpg/330px-Ofrenda_de_la_Liga_y_la_Champions-57-L.Mill%C3%A1n_%2852109310843%29_%28Luka_Modri%C4%87%29.jpg" },
  { name: "Federico Valverde", code: "URU", position: "MF", number: 15, club: "Real Madrid", age: 27, goals: 2, assists: 2, xg: 1.6, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Federico_Valverde_2021_%28cropped%29.jpg/330px-Federico_Valverde_2021_%28cropped%29.jpg" },
  { name: "Darwin Núñez", code: "URU", position: "FW", number: 9, club: "Al Hilal SFC", age: 26, goals: 3, assists: 1, xg: 3, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Darwin_N%C3%BA%C3%B1ez_%28cropped%29.jpg/330px-Darwin_N%C3%BA%C3%B1ez_%28cropped%29.jpg" },
  { name: "Luis Díaz", code: "COL", position: "FW", number: 7, club: "Bayern Munich", age: 29, goals: 3, assists: 2, xg: 2.5, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/FC_RB_Salzburg_gegen_FC_Bayern_M%C3%BCnchen_%282026-01-06_Testspiel%29_40_%28Luiz_D%C3%ADaz%29.jpg/330px-FC_RB_Salzburg_gegen_FC_Bayern_M%C3%BCnchen_%282026-01-06_Testspiel%29_40_%28Luiz_D%C3%ADaz%29.jpg" },
  { name: "James Rodríguez", code: "COL", position: "MF", number: 10, club: "Club León", age: 34, goals: 1, assists: 4, xg: 1, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/James_Rodriguez_2018.jpg/330px-James_Rodriguez_2018.jpg" },
  { name: "Christian Pulisic", code: "USA", position: "FW", number: 10, club: "AC Milan", age: 27, goals: 2, assists: 3, xg: 1.7, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Christian_Pulisic_USMNT_v_Belgium_Mar_28_2026-73_%28cropped%29.jpg/330px-Christian_Pulisic_USMNT_v_Belgium_Mar_28_2026-73_%28cropped%29.jpg" },
  { name: "Weston McKennie", code: "USA", position: "MF", number: 8, club: "Juventus", age: 27, goals: 1, assists: 1, xg: 0.7, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Weston_McKennie_USMNT_v_Belgium_Mar_28_2026-68_%28cropped%29.jpg/330px-Weston_McKennie_USMNT_v_Belgium_Mar_28_2026-68_%28cropped%29.jpg" },
  { name: "Santiago Giménez", code: "MEX", position: "FW", number: 9, club: "AC Milan", age: 25, goals: 3, assists: 0, xg: 2.6, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Santiago_Gim%C3%A9nez.png/330px-Santiago_Gim%C3%A9nez.png" },
  { name: "Hirving Lozano", code: "MEX", position: "FW", number: 22, club: "San Diego FC", age: 30, goals: 2, assists: 2, xg: 1.5, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Hirving_Lozano.png/330px-Hirving_Lozano.png" },
  { name: "Alphonso Davies", code: "CAN", position: "DF", number: 19, club: "Bayern Munich", age: 25, goals: 1, assists: 2, xg: 0.6, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Alphonso_Davies_in_2022.jpg/330px-Alphonso_Davies_in_2022.jpg" },
  { name: "Jonathan David", code: "CAN", position: "FW", number: 20, club: "Juventus", age: 26, goals: 4, assists: 1, xg: 3.4, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Jonathan_David_asse_losc_2425_%28cropped%29.jpg/330px-Jonathan_David_asse_losc_2425_%28cropped%29.jpg" },
  { name: "Achraf Hakimi", code: "MAR", position: "DF", number: 2, club: "Paris Saint-Germain", age: 27, goals: 1, assists: 3, xg: 0.9, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Achraf_Hakimi_Morocco_v_Norway_7_June_2026-16.jpg/330px-Achraf_Hakimi_Morocco_v_Norway_7_June_2026-16.jpg" },
  { name: "Sadio Mané", code: "SEN", position: "FW", number: 10, club: "Al-Nassr", age: 33, goals: 3, assists: 1, xg: 2.6, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Sadio_Mane_Al-Nassr.jpg/330px-Sadio_Mane_Al-Nassr.jpg" },
  { name: "Mohamed Salah", code: "EGY", position: "FW", number: 10, club: "Liverpool", age: 33, goals: 5, assists: 3, xg: 4.4, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Mohamed_Salah_2018.jpg/330px-Mohamed_Salah_2018.jpg" },
  { name: "Son Heung-min", code: "KOR", position: "FW", number: 7, club: "Los Angeles FC", age: 33, goals: 3, assists: 2, xg: 2.5, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/BFA_2023_-2_Heung-Min_Son_%28cropped%29.jpg/330px-BFA_2023_-2_Heung-Min_Son_%28cropped%29.jpg" },
  { name: "Takefusa Kubo", code: "JPN", position: "MF", number: 11, club: "Real Sociedad", age: 24, goals: 2, assists: 2, xg: 1.4, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Takefusa_Kubo_2019.png/330px-Takefusa_Kubo_2019.png" },
  { name: "Granit Xhaka", code: "SUI", position: "MF", number: 10, club: "Bayer Leverkusen", age: 33, goals: 1, assists: 1, xg: 0.6, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Granit_Xhaka_%28cropped%29.jpg/330px-Granit_Xhaka_%28cropped%29.jpg" },
  { name: "Mehdi Taremi", code: "IRN", position: "FW", number: 9, club: "Inter Milan", age: 33, goals: 2, assists: 1, xg: 1.8, photo: "https://upload.wikimedia.org/wikipedia/commons/7/74/Iran_-_Japan%2C_AFC_Asian_Cup_2019_42_%28cropped%29.jpg" },
];

export const SEED_ACHIEVEMENTS = [
  { key: 'first_prediction', name: 'First Steps', description: 'Make your first prediction', tier: 'bronze', criteria: { type: 'predictions_count', threshold: 1 } },
  { key: 'sharp_eye', name: 'Sharp Eye', description: 'Reach 60% prediction accuracy', tier: 'silver', criteria: { type: 'accuracy', threshold: 60 } },
  { key: 'oracle', name: 'The Oracle', description: 'Reach 80% prediction accuracy', tier: 'gold', criteria: { type: 'accuracy', threshold: 80 } },
  { key: 'centurion', name: 'Centurion', description: 'Make 100 predictions', tier: 'silver', criteria: { type: 'predictions_count', threshold: 100 } },
  { key: 'champion_caller', name: 'Champion Caller', description: 'Correctly predict the tournament winner', tier: 'gold', criteria: { type: 'winner_correct', threshold: 1 } },
];
