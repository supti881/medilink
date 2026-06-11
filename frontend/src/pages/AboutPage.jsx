import CtaJoinUs from "./aboutPageComponents/CtaJoinUs"
import HeroAbout from "./aboutPageComponents/HeroAbout"
import OurMission from "./aboutPageComponents/OurMission"
import OurTeam from "./aboutPageComponents/OurTeam"
import OurValues from "./aboutPageComponents/OurValues"
import OurVision from "./aboutPageComponents/OurVision"
import Testimonials from "./aboutPageComponents/Testimonials"
import TimelineMilestones from "./aboutPageComponents/TimelineMilestones"
import TrustedPartners from "./aboutPageComponents/TrustedPartners"


const AboutPage =()=>
{
    return (
        <div  className="w-full min-h-screen bg-[#090a0f] selection:bg-indigo-500 selection:text-white">
               <HeroAbout></HeroAbout>
               <OurMission></OurMission>
               <OurVision></OurVision>
               <OurValues></OurValues>
               <OurTeam></OurTeam>
               <TimelineMilestones></TimelineMilestones>
               <TrustedPartners></TrustedPartners>
               <Testimonials></Testimonials>
               <CtaJoinUs></CtaJoinUs>



        </div>
    )
}

export default AboutPage