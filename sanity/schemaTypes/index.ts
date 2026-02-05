import { type SchemaTypeDefinition } from 'sanity'
import review from '../schemas/review'
import booking from '../schemas/booking'
import maintenanceDate from '../schemas/maintenanceDate'
import gallery from '../schemas/gallery'
import boatRental from '../schemas/boatRental'
import jetSkiRental from '../schemas/jetSkiRental'
import waterSports from '../schemas/waterSports'
import faq from '../schemas/faq'
import safety from '../schemas/safety'
import privacyPolicy from '../schemas/privacy-policy'
import discount from '../schemas/discount'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [booking, maintenanceDate, boatRental, jetSkiRental, waterSports, gallery, review, faq, safety, privacyPolicy, discount],
}
