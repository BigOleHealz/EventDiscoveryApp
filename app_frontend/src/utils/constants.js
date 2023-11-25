import '../css/common.css';
// import arts_and_crafts_icon from '../assets/event_type_icons/Arts&Crafts.png';
// import book_club_icon from '../assets/event_type_icons/BookClub.png';
// import comedy_icon from '../assets/event_type_icons/Comedy.png';
// import community_icon from '../assets/event_type_icons/Community.png';
// import cooking_class_icon from '../assets/event_type_icons/CookingClass.png';
// import dancing_icon from '../assets/event_type_icons/Dancing.png';
// // import festival_icon from '../assets/event_type_icons/Festival.png';
// import food_and_drinks_specials_icon from '../assets/event_type_icons/Food&DrinksSpecials.png';
// import games_icon from '../assets/event_type_icons/Games.png';
// import happy_hour_icon from '../assets/event_type_icons/HappyHour.png';
// import health_fitness_sports_wellness_yoga_icon from '../assets/event_type_icons/HealthFitnessSportsWellness&Yoga.png';
// import kids_and_children_icon from '../assets/event_type_icons/Kids&Children.png';
// import lgbtq_icon from '../assets/event_type_icons/LGBTQ+.png';
// import live_music_and_concerts_icon from '../assets/event_type_icons/LiveMusic&Concerts.png';
// import outdoor_activities_icon from '../assets/event_type_icons/OutdoorActivities.png';
// import political_icon from '../assets/event_type_icons/Political.png';
// import professional_networking_icon from '../assets/event_type_icons/Professional&Networking.png';
// import religious_icon from '../assets/event_type_icons/Religious.png';
// import science_technology_icon from '../assets/event_type_icons/Science&Technology.png';
// import self_improvement_icon from '../assets/event_type_icons/Self-Improvement.png';
// import social_icon from '../assets/event_type_icons/Social.png';
// import sports_icon from '../assets/event_type_icons/Sports.png';
// import tours_icon from '../assets/event_type_icons/Tours.png';
// import trivia_icon from '../assets/event_type_icons/Trivia.png';
// import volunteering_icon from '../assets/event_type_icons/Volunteering.png';
// import yoga_icon from '../assets/event_type_icons/Yoga.png';


export const day_start_time = '00:00:00';
export const day_end_time = '23:59:59';
export const day_format = 'yyyy-MM-dd';
export const date_time_format = "yyyy-MM-dd'T'HH:mm:ss";

// export const event_types_icon_map = {
//     "Arts & Crafts": arts_and_crafts_icon,
//     "Book Club": book_club_icon,
//     "Comedy": comedy_icon,
//     "Community": community_icon,
//     "Cooking Class": cooking_class_icon,
//     "Dancing": dancing_icon,
//     // "Festival": festival_icon,
//     "Food & Drinks Specials": food_and_drinks_specials_icon,
//     "Games": games_icon,
//     "Happy Hour": happy_hour_icon,
//     "Health, Fitness, Sports, Wellness, & Yoga": health_fitness_sports_wellness_yoga_icon,
//     "Kids & Children": kids_and_children_icon,
//     "LGBTQ+": lgbtq_icon,
//     "Live Music & Concerts": live_music_and_concerts_icon,
//     "Outdoor Activities": outdoor_activities_icon,
//     "Political": political_icon,
//     "Professional & Networking": professional_networking_icon,
//     "Religious": religious_icon,
//     "Science & Technology": science_technology_icon,
//     "Self-Improvement": self_improvement_icon,
//     "Social": social_icon,
//     "Sports": sports_icon,
//     "Tours": tours_icon,
//     "Trivia": trivia_icon,
//     "Volunteering": volunteering_icon,
//     "Yoga": yoga_icon
// };

export const defaultCenter = {
    lat: 25.7687552,
    lng: -80.196559
};

export const icon_size = {
    height: 75,
    width: 45
};

export const iconSvgObject = (fillColor) => {
  const scale = 1.5;
  return {
    path: 'M12,2C8.13,2,5,5.13,5,9c0,5.25,7,13,7,13s7-7.75,7-13c0-3.87-3.13-7-7-7z M12,11.5c-1.38,0-2.5-1.12-2.5-2.5s1.12-2.5,2.5-2.5s2.5,1.12,2.5,2.5 S13.38,11.5,12,11.5z',
    fillColor: fillColor,
    fillOpacity: 1,
    scale: scale,
  };
};

export const iconSvgClass = (fillColor) => {
  return (
    <svg height="50" width="30">
      <path 
        d='M12,2C8.13,2,5,5.13,5,9c0,5.25,7,13,7,13s7-7.75,7-13c0-3.87-3.13-7-7-7z M12,11.5c-1.38,0-2.5-1.12-2.5-2.5s1.12-2.5,2.5-2.5s2.5,1.12,2.5,2.5 S13.38,11.5,12,11.5z'
        fill={fillColor}
        fillOpacity={1}
        strokeWeight={1}
        scale={1.5}
      />
    </svg>
  );
};

export const iconSvgDataUrl = (fillColor) => {
  const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="100" width="60">
    <path 
      d='M12,2C8.13,2,5,5.13,5,9c0,5.25,7,13,7,13s7-7.75,7-13c0-3.87-3.13-7-7-7z M12,11.5c-1.38,0-2.5-1.12-2.5-2.5s1.12-2.5,2.5-2.5s2.5,1.12,2.5,2.5 S13.38,11.5,12,11.5z'
      fill="${fillColor}"
      fillOpacity="1"
      strokeWeight="1"
      scale="1.5"
    />
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svgStr);
};
export function SvgOverlay() {
  return (
    <div className="svg-overlay">
      {iconSvgClass('red')}
    </div>
  );
}
