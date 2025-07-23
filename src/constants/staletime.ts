const enum StaleTime{
    // The data is considered fresh for 1 minut
    OneMinute = 60 * 1000,

    // The data is considered fresh for 2 minutes
    TwoMinutes = 2 * 60 * 1000,

    // The data is considered fresh for 5 minutes
    FiveMinutes = 5 * 60 * 1000,
    
    // The data is considered fresh for 10 minutes
    TenMinutes = 10 * 60 * 1000,
    
    // The data is considered fresh for 15 minutes
    FifteenMinutes = 15 * 60 * 1000,

    // The data is considered fresh for 30 minutes
    ThirtyMinutes = 30 * 60 * 1000,
    
    // The data is considered fresh for 1 hour
    OneHour = 60 * 60 * 1000,
    
    // The data is considered fresh for 2 hours
    TwoHours = 2 * 60 * 60 * 1000,
    
    // The data is considered fresh for a day
    OneDay = 24 * 60 * 60 * 1000,
    
    // The data is considered fresh for a week
    OneWeek = 7 * OneDay,
  
}

export default StaleTime;