import mongoose from 'mongoose';

/**
 * Interface that describes the properties required to create a new ticket
 */
interface TicketAttrs {
  title: string;
  price: number;
  userId: string;
}

/**
 * Interface that describes properties that a Ticket model has
 */
interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
}

/**
 * Interface that describes the properties that a Ticket Document has
 */
interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  userId: string;
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    userId: {
      type: String,
      required: true
    }
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      }
    }
  }
);

/**
 *
 * @param attrs ticket arguments as described in TicketAttrs
 * Add build function to TicketModel/mongoose prototype => Ticket.build(Attrs)
 * Build pattern to make sure TS checks Ticket attrs
 */
ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket(attrs);
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };
