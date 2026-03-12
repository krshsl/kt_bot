import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { OrgUser } from "./org_user";
import { Organization } from "./organization";

@Entity("phone")
@Index(["user_id", "org_id"], { unique: true })
export class Phone {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  phone!: string;

  @Column({ nullable: true })
  user_id?: string;

  @Column({ nullable: true })
  org_id?: string;

  @ManyToOne(() => OrgUser, (user) => user.phones, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user?: OrgUser;

  @ManyToOne(() => Organization, (org) => org.phones, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "org_id" })
  org?: Organization;
}
