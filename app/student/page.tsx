import DashBoardNavbar from '@/components/layout/DashBoardNavbar'
import DowloadSection from '@/components/layout/DowloadSection'
import Header from '@/components/layout/Header'
const StudentDashboard = () => {
  return (
    <div className='flex  flex-col justify-center items-center'>
      <DashBoardNavbar/>
      <Header/>
      <DowloadSection/>
      {/* <Footer/> */}
      <h1>student page</h1>
    </div>
  )
}

export default StudentDashboard