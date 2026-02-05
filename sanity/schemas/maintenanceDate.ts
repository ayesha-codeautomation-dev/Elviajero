// schemas/maintenanceDate.js
export default {
    name: 'maintenanceDate',
    title: 'Maintenance Date',
    type: 'document',
    fields: [
      {
        name: 'date',
        title: 'Date',
        type: 'date',
      },
      {
        name: 'reason',
        title: 'Reason for Maintenance',
        type: 'string',
        description: 'Reason for blocking this date (optional)',
      },
    ],
  };
  