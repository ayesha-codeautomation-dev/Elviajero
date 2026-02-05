export default {
    name: 'booking',
    title: 'Booking',
    type: 'document',
    fields: [
        {
            name: 'bookingId',
            title: 'Booking ID',
            type: 'string',
          },
      {
        name: 'date',
        title: 'Booking Date',
        type: 'date',
      },
      {
        name: 'timeSlot',
        title: 'Time Slot',
        type: 'string',
      },
      {
        name: 'boatCount',
        title: 'Boats Reserved',
        type: 'number',
      },
      {
        name: 'jetSkiCount',
        title: 'Jet Skis Reserved',
        type: 'number',
      },
      {
        name: 'waterSports',
        title: 'Water Sports',
        type: 'array',
        of: [
          {
            type: 'object',
            fields: [
              {
                name: 'sport',
                title: 'Sport Name',
                type: 'string',
              },
              // {
              //   name: 'peopleCount',
              //   title: 'Number of People',
              //   type: 'number',
              //   validation: (Rule: { min: (arg0: number) => { (): any; new(): any; max: { (arg0: number): any; new(): any; }; }; }) => Rule.min(1).max(6),
              // },
            ],
          },
        ],
      },
      {
        name: 'rentalType',
        title: 'Rental Type',
        type: 'string',
      },
      {
        name: 'numberofHours',
        title: 'Number of Hours',
        type: 'number',
      },
      {
        name: 'waitingTime',
        title: 'Waiting Time (Hours)',
        type: 'number',
      },
      {
        name: 'pickup',
        title: 'Pickup Location',
        type: 'string',
      },
      {
        name: 'destination',
        title: 'Destination Location',
        type: 'string',
      },
      {
        name: 'people',
        title: 'Number of People',
        type: 'number',
      },
      {
        name: 'totalPrice',
        title: 'Total Price',
        type: 'number',
      },
    ],
  };
  