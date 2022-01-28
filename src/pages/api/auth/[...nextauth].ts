import { query as q } from 'faunadb';

import NextAuth from 'next-auth';
import GithubProviders from 'next-auth/providers/github';

import { fauna } from '../../../services/fauna';

export default NextAuth({

  providers: [
    GithubProviders({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization:{
        params:{
          scope: 'read:user'
        }
      }
    }),
  ],
  callbacks:{
    async signIn({user, account, profile}){
      const { email } = user;

      try{ //Evita o login se a inserção der errado
        await fauna.query( //inserção no banco
          q.If(
            q.Not(
              q.Exists(
                q.Match(
                  q.Index('user_by_email'), //index criado no fauna
                  q.Casefold(user.email) //padroniza o email
                )
              )
            ),//faça
            q.Create(
              q.Collection('users'),
              { data: {email}}
            ), //senão
            q.Get(
              q.Match(
                q.Index('user_by_email'), 
                q.Casefold(user.email) 
              )
            )
          )
        )
        
        return true; 
      } catch (err) {
        console.log(err);
        return false;
      }
      
      console.log(user);
    },
  }
})
