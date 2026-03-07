import { getProjects, getProjectById } from './lib/supabase/services/project-service.js'

async function test() {
    console.log('Fetching projects...')
    const projects = await getProjects()
    if (projects.length === 0) {
        console.log('No projects found.')
        return
    }

    const firstProject = projects[0]
    console.log(`Testing getProjectById for project [${firstProject.id}] - [${firstProject.title}]`)

    const project = await getProjectById(firstProject.id)
    if (project) {
        console.log('Success! Project found:', project.title)
        console.log('Relationships found:', Object.keys(project).filter(k => Array.isArray(project[k])))
    } else {
        console.error('FAILED to fetch project detail.')
    }
}

test().catch(console.error)
