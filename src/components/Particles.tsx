import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { useState, useRef } from "react";

const ParticlesComponent = () => {
    const [init, setInit] = useState(false);
    const initRef = useRef(false);

    if (!initRef.current) {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => {
            setInit(true);
        });
        initRef.current = true;
    }

    return (
        <>
            {init && (
                <Particles
                    id="tsparticles"
                    options={{
                        background: {
                            color: {
                                value: "#000000",
                            },
                        },
                        fpsLimit: 60,
                        interactivity: {
                            events: {
                                onHover: {
                                    enable: true,
                                    mode: "repulse",
                                },

                            },
                            modes: {
                                push: {
                                    quantity: 4,
                                },
                                repulse: {
                                    distance: 200,
                                    duration: 0.4,
                                },
                            },
                        },
                        particles: {
                            color: {
                                value: "#ffffff",
                            },
                            links: {
                                color: "#ffffff",
                                distance: 150,
                                enable: true,
                                opacity: 0.5,
                                width: 0.25,
                            },
                            move: {
                                direction: "none",
                                enable: true,
                                outModes: {
                                    default: "bounce",
                                },
                                random: false,
                                speed: 0.5,
                                straight: false,
                            },
                            number: {
                                density: {
                                    enable: true,
                                },
                                value: 200,
                            },
                            opacity: {
                                value: 1,
                            },
                            shape: {
                                type: "circle",
                            },
                            size: {
                                value: { min: 0.5, max: 1 },
                            },
                        },
                        detectRetina: false,
                    }}
                />
            )}
        </>
    );
};

export default ParticlesComponent;