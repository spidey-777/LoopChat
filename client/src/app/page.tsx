import { redirect } from 'next/navigation'

const Home = () => {
  return redirect('/chat')
}

export default Home