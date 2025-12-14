import { Swiper, SwiperSlide, } from "swiper/react";
import { Autoplay, } from "swiper/modules";
import { useEffect, useRef, useState } from "react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import type { Swiper as SwiperType } from "swiper";
export function TestimonialSlider() {
  const swiperRef = useRef<SwiperType | any>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const testimonials = [
    {
      quote:
        "Safe PHV Software has streamlined our entire pharmacovigilance workflow. Case intake, reporting, and compliance have never been easier.",
      name: "Dr. Aisha Rahman",
      role: "Head of Drug Safety",
      company: "BioNova Pharmaceuticals",
    },
    {
      quote:
        "The automation features save us countless hours each month. We can now focus on analysis instead of manual data entry.",
      name: "Liam Chen",
      role: "Pharmacovigilance Specialist",
      company: "MedTrust Labs",
    },
    {
      quote:
        "Regulatory submissions are now smooth and error-free. Safe PHV keeps us compliant with global guidelines effortlessly.",
      name: "Sofia Almeida",
      role: "Regulatory Affairs Manager",
      company: "HealthSure Pharma",
    },
    {
      quote:
        "The signal detection module is incredibly powerful — we’re identifying risks earlier and improving patient safety.",
      name: "Dr. James Carter",
      role: "Medical Safety Officer",
      company: "Apex BioTech",
    },
    {
      quote:
        "Safe PHV has simplified collaboration across teams and regions. It’s a true game changer for our safety operations.",
      name: "Priya Desai",
      role: "Global Safety Lead",
      company: "VitaCore Therapeutics",
    },
    {
      quote:
        "The interface is intuitive and the training time was minimal. Even new team members get up to speed quickly.",
      name: "Marcus Brown",
      role: "Drug Safety Associate",
      company: "NovaCure Pharma",
    },
    {
      quote:
        "Safe PHV has elevated our pharmacovigilance standards. We feel confident in every audit and inspection.",
      name: "Elena Petrova",
      role: "Quality & Compliance Director",
      company: "Zenith Lifesciences",
    },
  ];

  const autoplayDelay = 3000;
  useEffect(() => {
    setProgress(0);
    let start = Date.now();

    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const percentage = Math.min((elapsed / autoplayDelay) * 100, 100);
      setProgress(percentage);
      if (percentage === 100) clearInterval(timer);
    }, 50);
    return () => clearInterval(timer);
  }, [activeIndex]);
  return (
    <div className="absolute bottom-7 left-7">
      <div className="relative" onWheel={(e) => {
        e.preventDefault()
        if (e.deltaY > 0) {
          swiperRef.current.slidePrev()
        } else {
          swiperRef.current.slideNext()
        }
      }}>
        <Swiper
          loop
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          slidesPerView={1}
          spaceBetween={20}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          className="login-Swiper overflow-hidden"
          autoplay={{
            delay: autoplayDelay,
          }}
          modules={[Autoplay]}
        >
          {testimonials.map((item, index) => (
            <SwiperSlide key={index}>
              <div className="bg-white/20 backdrop-blur-lg border border-white/50  p-6 shadow-lg h-70">
                <p className="text-amber-50 font-poppins font-semibold text-2xl mb-4">"{item.quote}"</p>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl text-amber-50 font-poppins font-semibold">{item.name}</h3>
                </div>
                <div className="flex items-center justify-between">
                  <div className="">
                    <p className="text-amber-50 font-poppins font-semibold mb-1">{item.role}</p>
                    <p className="text-amber-50 font-poppins">{item.company}</p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="flex gap-3 justify-center mt-4">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => swiperRef.current.slideToLoop(index)}
              className={`${activeIndex === index ? 'w-5' : 'cursor-pointer'} transition-all relative w-2.5 h-2.5 rounded-full border border-white/50`}
            >
              {activeIndex === index && <span
                style={{
                  width: progress + '%',
                }}
                className="bg-white transition-all absolute top-0 left-0 h-full rounded-full"></span>}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}

