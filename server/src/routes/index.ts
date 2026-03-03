import type { Express } from "express";
import authRoutes from "./auth.routes.js";
import programsRoutes from "./programs.routes.js";
import testimonialsRoutes from "./testimonials.routes.js";
import registrationsRoutes from "./registrations.routes.js";
import contactsRoutes from "./contacts.routes.js";
import galleryRoutes from "./gallery.routes.js";
import advantagesRoutes from "./advantages.routes.js";
import settingsRoutes from "./settings.routes.js";

export function mountRoutes(app: Express) {
    app.use(authRoutes);
    app.use(programsRoutes);
    app.use(testimonialsRoutes);
    app.use(registrationsRoutes);
    app.use(contactsRoutes);
    app.use(galleryRoutes);
    app.use(advantagesRoutes);
    app.use(settingsRoutes);
}
