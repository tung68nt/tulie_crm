import { getProjectById } from './lib/supabase/services/project-service.ts'

async function test() {
    const id = '57278d58-d6fe-45d8-85be-3ec9e089abc5'
    console.log(`Testing getProjectById for id: ${id}`)
    try {
        const project = await getProjectById(id)
        console.log('Project found:', !!project)
        if (project) {
            console.log('Project title:', project.title)
        }
    } catch (e) {
        console.error('Error during test:', e)
    }
}

test()
