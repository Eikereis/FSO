const Course = ({course}) => {
  console.log("course", course)
  const CourseHeader = <Header course={course} />
  const CourseContent = <Content parts={course.parts} />
  const CourseTotal = <Total parts={course.parts} />

  return (
    <div>
      {CourseHeader}
      {CourseContent}
      {CourseTotal}
    </div>
  )
}
