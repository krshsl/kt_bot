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
@Index(["email", "org_id"], { unique: true })
export class OrgUser {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  email!: string;

  @Column()
  name!: string;

  @Column()
  org_id!: string;

  @ManyToOne(() => Organization, (org) => org.users, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "org_id" })
  org!: Organization;

  @OneToMany(() => Phone, (phone) => phone.user, { cascade: true })
  phones!: Phone[];
}
