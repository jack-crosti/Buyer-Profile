import { motion } from 'framer-motion';
import { confettiAnimation } from '../lib/utils/animations';

const ConfettiEffect = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-[#F4C542] rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100],
            x: [0, Math.random() * 100 - 50],
            opacity: [1, 0],
            rotate: [0, Math.random() * 360],
          }}
          transition={{
            duration: 1 + Math.random(),
            delay: Math.random() * 0.5,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
};

export default ConfettiEffect; 