<?php

declare(strict_types=1);

use App\Actions\Workflows\CreateWorkflowAction;
use App\Actions\Workflows\UpdateWorkflowAction;
use App\Http\Controllers\WorkflowController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Workflow Routes
|--------------------------------------------------------------------------
|
| Here you can register routes for workflow management.
| These routes can be shared between central and tenant applications.
|
*/

    Route::resource('workflows', WorkflowController::class)
        ->except(['update', 'store'])
        ->names([
            'index' => 'workflows.index',
            'create' => 'workflows.create',
            'edit' => 'workflows.edit',
            'store' => 'workflows.store',
            'show' => 'workflows.show',
            'update' => 'workflows.update',
            'destroy' => 'workflows.destroy',
        ]);

Route::get('workflows/{workflow}/executions', [WorkflowController::class, 'executions'])
    ->name('workflows.executions'); 

Route::put('workflows/{workflow}', UpdateWorkflowAction::class)
    ->name('workflows.update');

Route::post('workflows', CreateWorkflowAction::class)
    ->name('workflows.store');