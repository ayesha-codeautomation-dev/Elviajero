export default {
    name: "discount",
    type: "document",
    title: "Discount Codes",
    fields: [
      {
        name: "code",
        type: "string",
        title: "Discount Code",
      },
      {
        name: "discountPercentage",
        type: "number",
        title: "Discount Percentage",
      },
      {
        name: "validFrom",
        type: "datetime",
        title: "Valid From",
      },
      {
        name: "validUntil",
        type: "datetime",
        title: "Valid Until",
      },
      {
        name: "maxUsage",
        type: "number",
        title: "Max Usage",
      },
      {
        name: "usageCount",
        type: "number",
        title: "Usage Count",
        initialValue: 0,
      },
      {
        name: "active",
        type: "boolean",
        title: "Active",
        initialValue: true,
      },
    ],
  };
  