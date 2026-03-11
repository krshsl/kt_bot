import { Column, Entity, OneToMany,PrimaryGeneratedColumn } from "typeorm";

import { OrgUser } from "./org_user";
import { Phone } from "./phone";
import { Profile } from "./profile";

@Entity("organizations")
export class Organization {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @OneToMany(() => Phone, (phone) => phone.organization)
  phones?: Phone[];

  @OneToMany(() => Profile, (profile) => profile.organization)
  members?: Profile[];

  @OneToMany(() => OrgUser, (user) => user.organization)
  users?: OrgUser[];
}
