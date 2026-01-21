from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.enums import TA_LEFT, TA_CENTER

# Create PDF
pdf_file = "sample_resume.pdf"
doc = SimpleDocTemplate(pdf_file, pagesize=letter,
                        rightMargin=72, leftMargin=72,
                        topMargin=72, bottomMargin=18)

# Container for the 'Flowable' objects
elements = []

# Define styles
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='CustomTitle', parent=styles['Heading1'],
                         fontSize=24, textColor='black', spaceAfter=6,
                         alignment=TA_CENTER, fontName='Helvetica-Bold'))
styles.add(ParagraphStyle(name='CustomHeading', parent=styles['Heading2'],
                         fontSize=14, textColor='black', spaceAfter=6,
                         fontName='Helvetica-Bold'))
styles.add(ParagraphStyle(name='CustomBody', parent=styles['BodyText'],
                         fontSize=10, textColor='black', spaceAfter=6,
                         fontName='Helvetica'))

# Add content
elements.append(Paragraph("JOHN DOE", styles['CustomTitle']))
elements.append(Paragraph("Software Engineer", styles['CustomHeading']))
elements.append(Paragraph("john.doe@email.com | (555) 123-4567 | linkedin.com/in/johndoe | github.com/johndoe", styles['CustomBody']))
elements.append(Spacer(1, 0.2*inch))

elements.append(Paragraph("PROFESSIONAL SUMMARY", styles['CustomHeading']))
elements.append(Paragraph("Full-stack software engineer with 4 years of experience building scalable web applications and machine learning systems. Passionate about creating efficient, user-friendly solutions using modern technologies.", styles['CustomBody']))
elements.append(Spacer(1, 0.2*inch))

elements.append(Paragraph("TECHNICAL SKILLS", styles['CustomHeading']))
elements.append(Paragraph("<b>Languages:</b> Python, JavaScript, TypeScript, Java, SQL", styles['CustomBody']))
elements.append(Paragraph("<b>Frameworks:</b> React, Node.js, Flask, Django, TensorFlow, PyTorch", styles['CustomBody']))
elements.append(Paragraph("<b>Databases:</b> PostgreSQL, MongoDB, Redis", styles['CustomBody']))
elements.append(Paragraph("<b>Tools:</b> Docker, Kubernetes, AWS, Git, Jenkins", styles['CustomBody']))
elements.append(Spacer(1, 0.2*inch))

elements.append(Paragraph("PROFESSIONAL EXPERIENCE", styles['CustomHeading']))
elements.append(Paragraph("<b>Senior Software Engineer | TechCorp Inc. | San Francisco, CA | Jan 2022 - Present</b>", styles['CustomBody']))
elements.append(Paragraph("• Led development of a real-time analytics dashboard using React and Node.js, processing over 1M events per day", styles['CustomBody']))
elements.append(Paragraph("• Designed and implemented a microservices architecture using Docker and Kubernetes, reducing deployment time by 60%", styles['CustomBody']))
elements.append(Paragraph("• Built a recommendation engine using collaborative filtering in Python, increasing user engagement by 35%", styles['CustomBody']))
elements.append(Paragraph("• Mentored 3 junior engineers and conducted code reviews to maintain code quality standards", styles['CustomBody']))
elements.append(Spacer(1, 0.1*inch))

elements.append(Paragraph("<b>Software Engineer | DataSolutions LLC | Austin, TX | Jun 2020 - Dec 2021</b>", styles['CustomBody']))
elements.append(Paragraph("• Developed a customer churn prediction model using Random Forest and XGBoost, achieving 87% accuracy", styles['CustomBody']))
elements.append(Paragraph("• Created RESTful APIs using Flask and PostgreSQL to serve ML model predictions to production applications", styles['CustomBody']))
elements.append(Paragraph("• Implemented automated testing pipeline with pytest and Jenkins, reducing bugs in production by 40%", styles['CustomBody']))
elements.append(Paragraph("• Optimized database queries that improved application response time from 3 seconds to 500ms", styles['CustomBody']))
elements.append(Spacer(1, 0.2*inch))

elements.append(Paragraph("PROJECTS", styles['CustomHeading']))
elements.append(Paragraph("<b>E-Commerce Platform | Personal Project | 2023</b>", styles['CustomBody']))
elements.append(Paragraph("• Built a full-stack e-commerce application using React, Node.js, Express, and MongoDB", styles['CustomBody']))
elements.append(Paragraph("• Implemented JWT authentication, payment processing with Stripe API, and real-time inventory management", styles['CustomBody']))
elements.append(Paragraph("• Deployed on AWS EC2 with load balancing and auto-scaling capabilities", styles['CustomBody']))
elements.append(Paragraph("• Technologies: React, Node.js, MongoDB, AWS, Stripe API", styles['CustomBody']))
elements.append(Spacer(1, 0.1*inch))

elements.append(Paragraph("<b>Sentiment Analysis Tool | Open Source Contribution | 2022</b>", styles['CustomBody']))
elements.append(Paragraph("• Developed a sentiment analysis tool using BERT transformers and PyTorch", styles['CustomBody']))
elements.append(Paragraph("• Achieved 92% accuracy on movie review classification dataset", styles['CustomBody']))
elements.append(Paragraph("• Contributed to open-source NLP library with 500+ GitHub stars", styles['CustomBody']))
elements.append(Paragraph("• Technologies: Python, PyTorch, BERT, Hugging Face Transformers", styles['CustomBody']))
elements.append(Spacer(1, 0.2*inch))

elements.append(Paragraph("EDUCATION", styles['CustomHeading']))
elements.append(Paragraph("<b>Bachelor of Science in Computer Science | University of California, Berkeley | 2020</b>", styles['CustomBody']))
elements.append(Paragraph("GPA: 3.8/4.0 | Dean's List (4 semesters)", styles['CustomBody']))
elements.append(Spacer(1, 0.2*inch))

elements.append(Paragraph("CERTIFICATIONS", styles['CustomHeading']))
elements.append(Paragraph("• AWS Certified Solutions Architect - Associate (2023)", styles['CustomBody']))
elements.append(Paragraph("• Google Cloud Professional Data Engineer (2022)", styles['CustomBody']))

# Build PDF
doc.build(elements)
print(f"PDF created successfully: {pdf_file}")
