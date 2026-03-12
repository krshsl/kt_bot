import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

import { Organization } from "./organization";

// at the cost of having redudant data, we can replicate the same user in org level as well
@Entity("profile")
export class Profile {
  @PrimaryColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column()
  org_id!: string;

  @ManyToOne(() => Organization, (org) => org.admins, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "org_id" })
  org!: Organization;
}
