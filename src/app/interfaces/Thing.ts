import User from './User';

interface Thing {
  _id: string;
  type: 'Book' | 'Theater' | 'Concert' | 'Film' | 'Trip' | 'Food' | 'Activity' | 'Celebration';
  name: string;
  date: Date;
  review?: string;
  place?: string;
  rating?: number;
  user: User['_id'];
}

export default Thing;
