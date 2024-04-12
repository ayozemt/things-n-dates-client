import User from './User';

interface Thing {
  _id: String;
  type: 'Book' | 'Concert' | 'Film' | 'Trip' | 'Food' | 'Activity';
  name: String;
  date: Date;
  review?: String;
  place?: String;
  rating?: Number;
  user: User['_id'];
}

export default Thing;
