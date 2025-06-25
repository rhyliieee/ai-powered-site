// import React, { useState, useEffect, useMemo } from 'react';
// import { X, Calendar, Clock, MapPin, Video, User, Mail, Check, AlertCircle } from 'lucide-react';
// import { useGoogleApi } from '@/hooks/useGoogleAPI';

// // Shadcn UI components (you'll need to install these)
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
// import { Alert, AlertDescription } from '@/components/ui/alert';

// // --- Interfaces ---
// interface BookingModalProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// interface TimeSlot {
//   time: string; // "HH:mm" format
//   isAvailable: boolean;
// }

// interface BusySlot {
//     start: string;
//     end: string;
// }

// const YOUR_GOOGLE_ACCOUNT_EMAIL = "your-email@your-domain.com"; // <-- IMPORTANT: REPLACE WITH YOUR EMAIL

// const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose }) => {
//    const {
//     loading,
//     error,
//     getCalendarEvents,
//     createBooking
//   } = useGoogleApi();

//   // --- States ---
//   const [currentStep, setCurrentStep] = useState<'calendar' | 'form' | 'confirmation'>('calendar');
//   const [selectedDate, setSelectedDate] = useState<Date | null>(null);
//   const [selectedTime, setSelectedTime] = useState<string>('');
//   const [busySlots, setBusySlots] = useState<BusySlot[]>([]);
//   const [checkingAvailability, setCheckingAvailability] = useState(true);

//   // --- Form Data State ---
//   const [formData, setFormData] = useState({
//     guestEmail: '',
//     guestName: '',
//     duration: '30',
//     message: '',
//     location: 'google-meet' as 'google-meet' | 'in-person',
//     inPersonLocation: ''
//   });

//   // --- Generate Calendar Dates (Next 30 Days, Weekdays Only) ---
//   const calendarDates = useMemo(() => {
//     const dates: Date[] = [];
//     const today = new Date();
//     for (let i = 1; i <= 30; i++) {
//       const date = new Date(today);
//       date.setDate(today.getDate() + i);
//       if (date.getDay() !== 0 && date.getDay() !== 6) { // Skip Sunday (0) and Saturday (6)
//         dates.push(date);
//       }
//     }
//     return dates;
//   }, []);
  
//   // --- Fetch Busy Times for the Next 30 Days on Mount ---
//   useEffect(() => {
//     if (!isOpen) return;

//     const fetchAvailability = async () => {
//       setCheckingAvailability(true);
//       const startDate = new Date();
//       startDate.setHours(0, 0, 0, 0);

//       const endDate = new Date(startDate);
//       endDate.setDate(startDate.getDate() + 31);

//       // Fetch all events in the range
//       const events = await getCalendarEvents(startDate.toISOString(), endDate.toISOString());
//       // Map to busy slots (start/end)
//       const busy = (events || []).map((event: any) => ({
//         start: event.start?.dateTime || event.start?.date,
//         end: event.end?.dateTime || event.end?.date,
//       }));
//       setBusySlots(busy);
//       setCheckingAvailability(false);
//     };

//     fetchAvailability();
//   }, [isOpen, getCalendarEvents]);

//   // --- Calculate Available Time Slots for the Selected Date ---
//   const timeSlots = useMemo((): TimeSlot[] => {
//     if (!selectedDate) return [];
  
//     const slots: TimeSlot[] = [];
//     // Generate base slots from 9:00 AM to 4:30 PM
//     for (let hour = 9; hour < 17; hour++) {
//       for (let minute = 0; minute < 60; minute += 30) {
//         slots.push({
//           time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
//           isAvailable: true,
//         });
//       }
//     }
  
//     // Filter based on busy slots
//     const selectedDayStart = selectedDate.setHours(0, 0, 0, 0);
  
//     busySlots.forEach(busy => {
//       const busyStart = new Date(busy.start);
//       const busyEnd = new Date(busy.end);
  
//       // Check if the busy slot is on the selected date
//       if (busyStart.getTime() < selectedDayStart + 24 * 60 * 60 * 1000 && busyEnd.getTime() > selectedDayStart) {
//         slots.forEach(slot => {
//           const slotDateTime = new Date(selectedDate);
//           const [hours, minutes] = slot.time.split(':').map(Number);
//           slotDateTime.setHours(hours, minutes, 0, 0);
  
//           // Check for overlap
//           if (slotDateTime.getTime() >= busyStart.getTime() && slotDateTime.getTime() < busyEnd.getTime()) {
//             slot.isAvailable = false;
//           }
//         });
//       }
//     });
  
//     return slots;
//   }, [selectedDate, busySlots]);

//   // --- Check which dates are fully booked ---
//   const unavailableDates = useMemo(() => {
//       const unavailable = new Set<string>();
//       calendarDates.forEach(date => {
//           const daySlots = timeSlots.filter(slot => {
//               const slotDate = new Date(date);
//               const [hours, minutes] = slot.time.split(':').map(Number);
//               slotDate.setHours(hours, minutes);
//               return slotDate > new Date(); // Only consider future slots
//           });
//           if (daySlots.every(slot => !slot.isAvailable)) {
//               unavailable.add(date.toISOString().split('T')[0]);
//           }
//       });
//       return unavailable;
//   }, [calendarDates, timeSlots]);


//   // --- Event Handlers ---
//   const handleDateSelect = (date: Date) => {
//     setSelectedDate(date);
//     setSelectedTime(''); // Reset time selection
//   };

//   const handleTimeSelect = (time: string) => {
//     setSelectedTime(time);
//   };

//   const handleFormSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!selectedDate || !selectedTime) return;

//     const [hours, minutes] = selectedTime.split(':').map(Number);
//     const startDateTime = new Date(selectedDate);
//     startDateTime.setHours(hours, minutes);

//     const endDateTime = new Date(startDateTime.getTime() + parseInt(formData.duration) * 60000);

//     // Prepare BookingDetails for the hook
//     const bookingDetails = {
//       visitorEmail: formData.guestEmail,
//       startTime: startDateTime.toISOString(),
//       endTime: endDateTime.toISOString(),
//       message: formData.message,
//       location: formData.location === 'google-meet' ? 'Google Meet' : 'In-Person',
//       timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
//     };

//     try {
//       await createBooking(bookingDetails);
//       setCurrentStep('confirmation');
//     } catch (err) {
//       // Error is handled by the hook's error state
//     }
//   };

//   const handleClose = () => {
//     onClose();
//     setTimeout(() => {
//       setCurrentStep('calendar');
//       setSelectedDate(null);
//       setSelectedTime('');
//       setFormData({
//         guestEmail: '',
//         guestName: '',
//         duration: '30',
//         message: '',
//         location: 'google-meet',
//         inPersonLocation: ''
//       });
//     }, 300);
//   };


//   if (!isOpen) return null;

//   // --- Render Functions ---

//   const renderCalendarStep = () => (
//     <div>
//       <div className="flex items-center justify-between mb-6">
//         <h2 className="text-2xl font-bold text-primary font-montserrat">Select Date & Time</h2>
//         {(loading || checkingAvailability) && (
//           <div className="text-sm text-muted font-actor animate-pulse">Checking availability...</div>
//         )}
//       </div>
      
//       <div className="grid md:grid-cols-2 gap-8">
//         {/* Calendar */}
//         <div>
//           <h3 className="text-lg font-semibold text-secondary mb-4 font-roboto">Choose a Date</h3>
//           <div className="grid grid-cols-7 gap-2">
//             {calendarDates.map((date) => {
//               const dateStr = date.toISOString().split('T')[0];
//               const isUnavailable = unavailableDates.has(dateStr);
//               const isSelected = selectedDate?.toDateString() === date.toDateString();
              
//               return (
//                 <button
//                   key={dateStr}
//                   onClick={() => !isUnavailable && handleDateSelect(date)}
//                   disabled={isUnavailable || checkingAvailability}
//                   className={`
//                     p-3 text-sm rounded-lg border transition-all font-actor relative
//                     ${isSelected 
//                       ? 'bg-primary text-app border-primary' 
//                       : isUnavailable 
//                         ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
//                         : 'bg-app hover:bg-primary hover:text-app border-gray-200 text-primary hover:border-primary'
//                     }
//                   `}
//                 >
//                   {date.getDate()}
//                   {isUnavailable && (
//                     <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
//                   )}
//                 </button>
//               );
//             })}
//           </div>
//         </div>

//         {/* Time Slots */}
//         <div>
//           <h3 className="text-lg font-semibold text-secondary mb-4 font-roboto">
//             {selectedDate ? `Available Times - ${selectedDate.toLocaleDateString()}` : 'Select a date first'}
//           </h3>
          
//           {selectedDate ? (
//             <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
//               {timeSlots.map((slot) => (
//                 <button
//                   key={slot.time}
//                   onClick={() => handleTimeSelect(slot.time)}
//                   disabled={!slot.isAvailable}
//                   className={`
//                     p-3 text-sm rounded-lg border transition-all font-actor
//                     ${selectedTime === slot.time
//                       ? 'bg-primary text-app border-primary'
//                       : slot.isAvailable
//                         ? 'bg-app hover:bg-primary hover:text-app border-gray-200 text-primary hover:border-primary'
//                         : 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200 line-through'
//                     }
//                   `}
//                 >
//                   {slot.time}
//                 </button>
//               ))}
//             </div>
//           ) : (
//             <div className="text-center text-muted py-8 font-actor">
//               <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
//               <p>Please select a date to view available times</p>
//             </div>
//           )}
//         </div>
//       </div>
      
//       {selectedDate && selectedTime && (
//         <div className="mt-8 p-4 bg-gray-50 rounded-lg border">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-4 text-primary">
//               <Calendar className="w-5 h-5" />
//               <span className="font-actor">
//                 {selectedDate.toLocaleDateString()} at {selectedTime}
//               </span>
//             </div>
//             <Button 
//               onClick={() => setCurrentStep('form')}
//               className="bg-primary hover:bg-primary-hover text-app font-montserrat"
//             >
//               Continue
//             </Button>
//           </div>
//         </div>
//       )}
//     </div>
//   );

//   const renderFormStep = () => (
//     <div>
//         <h2 className="text-2xl font-bold text-primary mb-6 font-montserrat">Meeting Details</h2>
//         <form onSubmit={handleFormSubmit} className="space-y-6">
//             {/* Form fields are the same as your original component */}
//             <div className="grid md:grid-cols-2 gap-6">
//               <div>
//                 <Label htmlFor="guestName" className="text-secondary font-roboto">Full Name *</Label>
//                 <Input id="guestName" value={formData.guestName} onChange={(e) => setFormData(prev => ({ ...prev, guestName: e.target.value }))} required className="mt-2 border-gray-200 focus:border-primary" placeholder="Enter your full name" />
//               </div>
//               <div>
//                 <Label htmlFor="guestEmail" className="text-secondary font-roboto">Email Address *</Label>
//                 <Input id="guestEmail" type="email" value={formData.guestEmail} onChange={(e) => setFormData(prev => ({ ...prev, guestEmail: e.target.value }))} required className="mt-2 border-gray-200 focus:border-primary" placeholder="Enter your email address" />
//               </div>
//             </div>

//             <div>
//               <Label className="text-secondary font-roboto">Meeting Duration</Label>
//                 <Select value={formData.duration} onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}>
//                     <SelectTrigger className="mt-2 border-gray-200 focus:border-primary"><SelectValue /></SelectTrigger>
//                     <SelectContent>
//                         <SelectItem value="30">30 minutes</SelectItem>
//                         <SelectItem value="60">1 hour</SelectItem>
//                         <SelectItem value="90">1.5 hours</SelectItem>
//                     </SelectContent>
//                 </Select>
//             </div>

//             <div>
//                 <Label className="text-secondary font-roboto">Meeting Type</Label>
//                 <RadioGroup value={formData.location} onValueChange={(value: 'google-meet' | 'in-person') => setFormData(prev => ({ ...prev, location: value }))} className="mt-2">
//                     <div className="flex items-center space-x-2">
//                         <RadioGroupItem value="google-meet" id="google-meet" />
//                         <Label htmlFor="google-meet" className="flex items-center space-x-2 font-actor"><Video className="w-4 h-4" /><span>Google Meet (Online)</span></Label>
//                     </div>
//                     <div className="flex items-center space-x-2">
//                         <RadioGroupItem value="in-person" id="in-person" />
//                         <Label htmlFor="in-person" className="flex items-center space-x-2 font-actor"><MapPin className="w-4 h-4" /><span>In-Person Meeting</span></Label>
//                     </div>
//                 </RadioGroup>
//             </div>

//             {formData.location === 'in-person' && (
//                 <div>
//                     <Label htmlFor="inPersonLocation" className="text-secondary font-roboto">Meeting Location *</Label>
//                     <Input id="inPersonLocation" value={formData.inPersonLocation} onChange={(e) => setFormData(prev => ({ ...prev, inPersonLocation: e.target.value }))} required className="mt-2 border-gray-200 focus:border-primary" placeholder="Enter meeting address or location" />
//                 </div>
//             )}

//             <div>
//                 <Label htmlFor="message" className="text-secondary font-roboto">Additional Message (Optional)</Label>
//                 <Textarea id="message" value={formData.message} onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))} className="mt-2 border-gray-200 focus:border-primary" placeholder="Tell me what you'd like to discuss..." rows={3} />
//             </div>

//             <div className="bg-gray-50 p-4 rounded-lg border">
//                 <h4 className="font-semibold text-secondary mb-2 font-roboto">Meeting Summary</h4>
//                 <div className="space-y-2 text-sm text-muted font-actor">
//                     <div className="flex items-center space-x-2"><Calendar className="w-4 h-4" /><span>{selectedDate?.toLocaleDateString()} at {selectedTime}</span></div>
//                     <div className="flex items-center space-x-2"><Clock className="w-4 h-4" /><span>{formData.duration} minutes</span></div>
//                     <div className="flex items-center space-x-2">{formData.location === 'google-meet' ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}<span>{formData.location === 'google-meet' ? 'Google Meet' : formData.inPersonLocation || 'In-person'}</span></div>
//                 </div>
//             </div>

//             <div className="flex space-x-4">
//                 <Button type="button" onClick={() => setCurrentStep('calendar')} variant="outline" className="flex-1 border-primary text-primary hover:bg-primary hover:text-app font-montserrat">Back</Button>
//                 <Button type="submit" disabled={loading} className="flex-1 bg-primary hover:bg-primary-hover text-app font-montserrat">{loading ? 'Booking...' : 'Book Meeting'}</Button>
//             </div>
//         </form>
//     </div>
//   );

//   const renderConfirmationStep = () => (
//     <div className="text-center">
//         <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><Check className="w-8 h-8 text-green-600" /></div>
//         <h2 className="text-2xl font-bold text-primary mb-4 font-montserrat">Meeting Booked Successfully!</h2>
//         <div className="bg-gray-50 p-6 rounded-lg border mb-6 text-left">
//             <div className="space-y-3">
//                 <div className="flex items-center space-x-3"><User className="w-5 h-5 text-primary" /><span className="font-actor">{formData.guestName}</span></div>
//                 <div className="flex items-center space-x-3"><Mail className="w-5 h-5 text-primary" /><span className="font-actor">{formData.guestEmail}</span></div>
//                 <div className="flex items-center space-x-3"><Calendar className="w-5 h-5 text-primary" /><span className="font-actor">{selectedDate?.toLocaleDateString()} at {selectedTime}</span></div>
//                 <div className="flex items-center space-x-3"><Clock className="w-5 h-5 text-primary" /><span className="font-actor">{formData.duration} minutes</span></div>
//                 <div className="flex items-center space-x-3">{formData.location === 'google-meet' ? <Video className="w-5 h-5 text-primary" /> : <MapPin className="w-5 h-5 text-primary" />}<span className="font-actor">{formData.location === 'google-meet' ? 'Google Meet' : formData.inPersonLocation}</span></div>
//             </div>
//         </div>
//         <p className="text-muted mb-8 font-actor">A calendar invitation and confirmation email have been sent to your email address.</p>
//         <Button onClick={handleClose} className="bg-primary hover:bg-primary-hover text-app font-montserrat px-8">Close</Button>
//     </div>
//   );

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-app rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
//         <div className="flex items-center justify-between p-6 border-b border-gray-200">
//           <div className="flex items-center space-x-3">
//             <Calendar className="w-6 h-6 text-primary" />
//             <h1 className="text-xl font-bold text-primary font-montserrat">Book a Meeting</h1>
//           </div>
//           <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
//             <X className="w-5 h-5 text-muted" />
//           </button>
//         </div>

//         <div className="p-8 overflow-y-auto">
//           {error && (
//             <Alert variant="destructive" className="mb-6">
//               <AlertCircle className="h-4 w-4" />
//               <AlertDescription>{error.message}</AlertDescription>
//             </Alert>
//           )}

//           {currentStep === 'calendar' && renderCalendarStep()}
//           {currentStep === 'form' && renderFormStep()}
//           {currentStep === 'confirmation' && renderConfirmationStep()}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BookingModal;