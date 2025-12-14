import { Card } from 'antd';
import React, { useState } from 'react';
import { CardHeader } from '../CardHeader/CardHeader';
import { ChevronDown, LucideProps } from 'lucide-react';
import { motion } from 'motion/react';
import { CardProps } from 'antd/lib';

function AccordionCard({ children, icon, title, id, extra, closeable = true, ...rest }: CardProps & {
  children: React.ReactNode, icon?: React.ReactElement<LucideProps>;
  title: React.ReactNode;
  id?: string;
  extra?: React.ReactNode;
  closeable?: boolean
}) {
  const [isActive, setIsActive] = useState(true);
  const CardHeaderProps={
    title,
    icon,
    onClick:null as any, 
  }
  if(closeable){
    CardHeaderProps["onClick"]=()=>setIsActive(!isActive)
  }
  return (
    <Card
      rootClassName={`custom-card  ${!isActive ? "close" : ""}`} size='small' variant='borderless' className='!shadow-none'
      title={<CardHeader
       {...CardHeaderProps}
        extra={closeable ? <div className='dark:border-dark-border border-border-header border rounded-full p-0.5 flex items-center justify-center'>
          <ChevronDown size={15} className={`transition-all ease-in-out duration-300 ${isActive ? "rotate-180" : ""}`} />
        </div> : null
        }
      />}
      {...rest}
    >
      <motion.div
        initial={false}
        animate={
          isActive
            ? { opacity: 1, height: "auto", y: 0, scale: 1 }
            : { opacity: 0, height: 0, y: -10, scale: 0.95 }
        }
        transition={{ duration: 0.5, ease: [0.25, 0.8, 0.25, 1] }}
      >
        {children}
      </motion.div>

    </Card>
  )
}
export default React.memo(AccordionCard)

