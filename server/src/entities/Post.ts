import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	BaseEntity,
	ManyToOne,
	OneToMany
} from 'typeorm';
import { Field, Int, ObjectType } from 'type-graphql';
import { User } from './User';
import { Vote } from './Vote';

@ObjectType()
@Entity()
export class Post extends BaseEntity {
	@Field(() => Int)
	@PrimaryGeneratedColumn()
	id!: number;

	// @SerializedPrimaryKey()
	// id!: string;

	@Field()
	@Column()
	title!: string;

	@Field()
	@Column()
	text!: string;

	@Field()
	@Column({ type: 'int', default: 0 })
	points!: number;

	@Field(() => Int, { nullable: true })
	voteStatus: number | null; // 1, -1 or null

	@Field()
	@Column()
	creatorId: number;

	@Field()
	@ManyToOne(() => User, user => user.posts)
	creator: User;

	@OneToMany(() => Vote, vote => vote.post)
	votes: Vote[];

	@Field(() => String)
	@CreateDateColumn()
	createdAt: Date;

	@Field(() => String)
	@UpdateDateColumn()
	updatedAt: Date;

	// @Property({ nullable: true })
	// age?: number;

	// @Property()
	// termsAccepted: boolean = false;

	// @Property({ nullable: true })
	// identities?: string[];

	// @Property({ nullable: true })
	// born?: Date;

	// @OneToMany(() => Book, book => book.author)
	// books = new Collection<Book>(this);

	// @ManyToMany(() => Author)
	// friends = new Collection<Author>(this);

	// @ManyToOne(() => Book, { nullable: true })
	// favouriteBook?: Book;

	// @Property({ version: true })
	// version!: number;

	// constructor(name: string, email: string) {
	// 	this.name = name;
	// 	this.email = email;
	// }
}
