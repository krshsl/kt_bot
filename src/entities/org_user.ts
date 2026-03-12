import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

import { Organization } from "./organization";
import { Phone } from "./phone";

@Entity("org_user")
export class OrgUser {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  @Index({ unique: true })
  email!: string;

  @Column({ nullable: true })
  name?: string;

  @Column()
  org_id!: string;

  @ManyToOne(() => Organization, (org) => org.users)
  @JoinColumn({ name: "org_id" })
  organization!: Organization;

  @OneToMany(() => Phone, (phone) => phone.id)
  phones!: Phone[];
}
