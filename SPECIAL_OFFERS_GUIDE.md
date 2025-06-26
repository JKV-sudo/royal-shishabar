# Special Offers Management Guide

## Overview

The Special Offers feature allows administrators to create and manage promotional offers for customers. These offers can include discounts, limited-time deals, and special packages that are displayed prominently on the menu page.

## Features

### For Administrators

1. **Create Special Offers**
   - Set title and description
   - Define original and discounted prices
   - Set discount percentage (auto-calculated)
   - Choose category (Food, Drinks, Tobacco, Combo, Event, Other)
   - Set start and end dates
   - Add usage limits
   - Upload promotional images
   - Add terms and conditions

2. **Manage Special Offers**
   - View all offers in a comprehensive table
   - Search and filter by category and status
   - Edit existing offers
   - Activate/deactivate offers
   - Delete offers
   - Monitor usage statistics

3. **Real-time Updates**
   - All changes are reflected immediately
   - Active offers automatically appear on the customer menu
   - Usage tracking in real-time

### For Customers

1. **View Active Offers**
   - Special offers section on the menu page
   - Prominent display with discount badges
   - Original vs. discounted pricing
   - Expiration dates
   - Usage limits
   - Terms and conditions

2. **Offer Details**
   - Clear pricing comparison
   - Visual discount indicators
   - Professional presentation
   - Easy-to-read terms

## Admin Panel Integration

### Accessing Special Offers Management

1. Log in as an administrator
2. Navigate to the Admin Panel
3. Click on the "Sonderangebote" tab
4. Use the management interface to create and manage offers

### Creating a New Special Offer

1. Click "Neues Angebot" button
2. Fill in the required fields:
   - **Titel**: Offer name
   - **Kategorie**: Category selection
   - **Beschreibung**: Detailed description
   - **Ursprungspreis**: Original price in EUR
   - **Rabatt**: Discount percentage (0-100%)
   - **Startdatum**: When the offer becomes active
   - **Enddatum**: When the offer expires
   - **Maximale Nutzungen**: Optional usage limit
   - **Bild**: Optional promotional image
   - **Bedingungen**: Terms and conditions

3. Click "Erstellen" to save

### Managing Existing Offers

- **Edit**: Click the edit icon to modify an offer
- **Toggle Status**: Click the eye icon to activate/deactivate
- **Delete**: Click the trash icon to remove an offer
- **Search**: Use the search bar to find specific offers
- **Filter**: Use category and status filters

## Database Structure

### SpecialOffer Collection

```typescript
interface SpecialOffer {
  id?: string;
  title: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  imageUrl?: string;
  terms?: string[];
  maxUses?: number;
  currentUses: number;
  category: 'food' | 'drinks' | 'tobacco' | 'combo' | 'event' | 'other';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}
```

### Firestore Rules

- **Read Access**: Public (anyone can view active offers)
- **Write Access**: Admin only (create, update, delete)

## Best Practices

### Creating Effective Offers

1. **Clear Titles**: Use descriptive, attractive titles
2. **Compelling Descriptions**: Explain the value proposition
3. **Appropriate Discounts**: Balance profitability with attractiveness
4. **Realistic Timeframes**: Set reasonable start/end dates
5. **Clear Terms**: Specify any conditions or limitations
6. **Quality Images**: Use high-quality promotional images

### Management Tips

1. **Monitor Performance**: Track usage statistics
2. **Regular Updates**: Keep offers fresh and relevant
3. **Seasonal Promotions**: Plan offers around events and seasons
4. **A/B Testing**: Try different discount levels and descriptions
5. **Customer Feedback**: Listen to customer responses

### Technical Considerations

1. **Performance**: Offers are cached and updated in real-time
2. **Mobile Responsive**: All interfaces work on mobile devices
3. **Image Optimization**: Upload appropriately sized images
4. **Data Validation**: All inputs are validated before saving
5. **Error Handling**: Graceful error handling throughout

## Troubleshooting

### Common Issues

1. **Offers Not Appearing**
   - Check if the offer is active
   - Verify start/end dates
   - Ensure the offer hasn't reached usage limits

2. **Price Calculation Errors**
   - Original price must be greater than discounted price
   - Discount percentage is auto-calculated
   - All prices should be positive numbers

3. **Image Upload Issues**
   - Check file size (recommended: under 2MB)
   - Ensure proper image format (JPG, PNG, WebP)
   - Verify internet connection

4. **Date Issues**
   - End date must be after start date
   - Dates are in local timezone
   - Past dates will show as expired

### Support

For technical issues or questions about the Special Offers feature, please refer to the main documentation or contact the development team.

## Future Enhancements

Potential improvements for the Special Offers system:

1. **Advanced Analytics**: Detailed performance metrics
2. **Automated Offers**: Scheduled offer creation
3. **Customer Targeting**: Personalized offers
4. **Integration**: Connect with POS systems
5. **Notifications**: Alert customers about new offers
6. **Social Sharing**: Share offers on social media
7. **QR Codes**: Generate QR codes for offers
8. **Bulk Operations**: Manage multiple offers at once 