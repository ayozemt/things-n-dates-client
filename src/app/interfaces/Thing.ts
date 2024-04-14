import User from './User';

interface Thing {
  _id: string;
  type: 'Book' | 'Concert' | 'Film' | 'Trip' | 'Food' | 'Activity';
  name: string;
  date: Date;
  review?: string;
  place?: string;
  rating?: number;
  user: User['_id'];
}

export default Thing;
