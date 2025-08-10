'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Settings, Type, Palette, Eye, Plus, Trash2, AlertCircle } from 'lucide-react'

interface PropertyInspectorProps {
  formTitle: string
  formDescription: string
  activeField: any
  onFormTitleChange: (title: string) => void
  onFormDescriptionChange: (description: string) => void
  onFieldUpdate: (updates: any) => void
  onAllowMultipleChange?: (allow: boolean) => void
}

export function PropertyInspector({
  formTitle,
  formDescription,
  activeField,
  onFormTitleChange,
  onFormDescriptionChange,
  onFieldUpdate,
  onAllowMultipleChange
}: PropertyInspectorProps) {
  const handleFieldUpdate = (key: string, value: any) => {
    onFieldUpdate({ [key]: value })
  }

  const addOption = () => {
    const currentOptions = activeField?.options || []
    handleFieldUpdate('options', [...currentOptions, `Option ${currentOptions.length + 1}`])
  }

  const removeOption = (index: number) => {
    const currentOptions = activeField?.options || []
    handleFieldUpdate('options', currentOptions.filter((_: any, i: number) => i !== index))
  }

  const updateOption = (index: number, value: string) => {
    const currentOptions = activeField?.options || []
    const newOptions = [...currentOptions]
    newOptions[index] = value
    handleFieldUpdate('options', newOptions)
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-2">Properties</h2>
        <p className="text-sm text-slate-400">Configure your form and fields</p>
      </div>

      <Tabs defaultValue="form" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800">
          <TabsTrigger value="form" className="text-white">Form</TabsTrigger>
          <TabsTrigger value="field" className="text-white" disabled={!activeField}>
            Field
          </TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Form Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Form Title</Label>
                <Input
                  value={formTitle}
                  onChange={(e) => onFormTitleChange(e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white"
                  placeholder="Enter form title"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Description</Label>
                <Textarea
                  value={formDescription}
                  onChange={(e) => onFormDescriptionChange(e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white"
                  placeholder="Enter form description"
                />
              </div>

              <Separator className="bg-slate-700" />

              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-white">Form Behavior</h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Collect Email Addresses</Label>
                    <p className="text-xs text-slate-400">Require users to sign in</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                   <div>
                     <Label className="text-white">Allow Multiple Responses</Label>
                     <p className="text-xs text-slate-400">Users can submit multiple times</p>
                   </div>
                  <Switch onCheckedChange={(checked) => onAllowMultipleChange?.(checked)} />
                 </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Show Progress Bar</Label>
                    <p className="text-xs text-slate-400">Display completion progress</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Styling
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Theme</Label>
                <Select defaultValue="dark">
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Primary Color</Label>
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-blue-500 rounded border border-slate-600" />
                  <Input
                    value="#3B82F6"
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="field" className="space-y-6">
          {activeField ? (
            <>
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Type className="w-5 h-5" />
                    Field Properties
                    <Badge variant="secondary" className="ml-auto">
                      {activeField.type}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">Label</Label>
                    <Input
                      value={activeField.label}
                      onChange={(e) => handleFieldUpdate('label', e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white"
                      placeholder="Enter field label"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Placeholder</Label>
                    <Input
                      value={activeField.placeholder || ''}
                      onChange={(e) => handleFieldUpdate('placeholder', e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white"
                      placeholder="Enter placeholder text"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Help Text</Label>
                    <Textarea
                      value={activeField.helpText || ''}
                      onChange={(e) => handleFieldUpdate('helpText', e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white"
                      placeholder="Enter help text"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Required Field</Label>
                      <p className="text-xs text-slate-400">Users must fill this field</p>
                    </div>
                    <Switch
                      checked={activeField.required}
                      onCheckedChange={(checked) => handleFieldUpdate('required', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {(activeField.type === 'select' || activeField.type === 'radio' || activeField.type === 'checkbox') && (
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {activeField.options?.map((option: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          className="bg-slate-800 border-slate-600 text-white"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeOption(index)}
                          className="h-10 w-10 p-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    
                    <Button
                      variant="outline"
                      onClick={addOption}
                      className="w-full border-slate-600 text-white hover:border-slate-500"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Option
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Validation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activeField.type === 'text' && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-white">Minimum Length</Label>
                        <Input
                          type="number"
                          value={activeField.validation?.minLength || ''}
                          onChange={(e) => handleFieldUpdate('validation', {
                            ...activeField.validation,
                            minLength: parseInt(e.target.value) || undefined
                          })}
                          className="bg-slate-800 border-slate-600 text-white"
                          placeholder="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">Maximum Length</Label>
                        <Input
                          type="number"
                          value={activeField.validation?.maxLength || ''}
                          onChange={(e) => handleFieldUpdate('validation', {
                            ...activeField.validation,
                            maxLength: parseInt(e.target.value) || undefined
                          })}
                          className="bg-slate-800 border-slate-600 text-white"
                          placeholder="100"
                        />
                      </div>
                    </>
                  )}

                  {activeField.type === 'number' && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-white">Minimum Value</Label>
                        <Input
                          type="number"
                          value={activeField.validation?.min || ''}
                          onChange={(e) => handleFieldUpdate('validation', {
                            ...activeField.validation,
                            min: parseInt(e.target.value) || undefined
                          })}
                          className="bg-slate-800 border-slate-600 text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">Maximum Value</Label>
                        <Input
                          type="number"
                          value={activeField.validation?.max || ''}
                          onChange={(e) => handleFieldUpdate('validation', {
                            ...activeField.validation,
                            max: parseInt(e.target.value) || undefined
                          })}
                          className="bg-slate-800 border-slate-600 text-white"
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label className="text-white">Custom Validation Message</Label>
                    <Textarea
                      value={activeField.validation?.message || ''}
                      onChange={(e) => handleFieldUpdate('validation', {
                        ...activeField.validation,
                        message: e.target.value
                      })}
                      className="bg-slate-800 border-slate-600 text-white"
                      placeholder="Enter custom error message"
                    />
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-8 text-center">
                <Eye className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Field Selected</h3>
                <p className="text-slate-400">
                  Click on a field in the form canvas to edit its properties
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
