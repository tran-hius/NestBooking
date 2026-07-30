import { Destination } from "../../../../generated/prisma";

export interface IDestinationRepository {
  getActiveDestinations(): Promise<Destination[]>;
  getAllDestinations(): Promise<Destination[]>;
  createDestination(data: Partial<Destination>): Promise<Destination>;
  updateDestination(id: string, data: Partial<Destination>): Promise<Destination>;
  deleteDestination(id: string): Promise<void>;
  toggleFeatured(id: string): Promise<Destination>;
}
