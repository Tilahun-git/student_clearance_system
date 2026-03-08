import DashBoardNavbar from '@/components/layout/DashBoardNavbar'
import DowloadSection from '@/components/layout/DowloadSection'
import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
const StudentDashboard = () => {
  return (
    <div className='flex  flex-col justify-center items-center'>
      <DashBoardNavbar/>
      <Header/>
      <DowloadSection/>
      {/* <Footer/> */}
    </div>
  )
}

export default StudentDashboard