import { Entity, BaseEntity, ManyToOne, PrimaryColumn, Column } from 'typeorm';
import { User } from './User';
import { Post } from './Post';

// m to n, many to many relation
// users <-> posts, users can upvote many posts, posts can have many users who upvoted
// user -> join table <- post
// user -> vote <- post

@Entity()
export class Vote extends BaseEntity {
	@Column({ type: 'int' })
	value: number;

	@PrimaryColumn()
	userId!: number;

	@ManyToOne(() => User, user => user.votes)
	user!: User;

	@PrimaryColumn()
	postId!: number;

	@ManyToOne(() => Post, post => post.votes)
	post!: Post;
}
