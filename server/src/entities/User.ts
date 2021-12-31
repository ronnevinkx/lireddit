import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	BaseEntity,
	OneToMany
} from 'typeorm';
import { Field, Int, ObjectType } from 'type-graphql';
import { Post } from './Post';
import { Vote } from './Vote';

@ObjectType()
@Entity()
export class User extends BaseEntity {
	@Field(() => Int)
	@PrimaryGeneratedColumn()
	id!: number;

	@Field()
	@Column({ unique: true })
	username!: string;

	@Field()
	@Column({ unique: true })
	email!: string;

	// remove the @Field() prop as to not expose this to graphql
	@Column()
	password!: string;

	@OneToMany(() => Post, post => post.creator)
	posts: Post[];

	@OneToMany(() => Vote, vote => vote.user)
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
